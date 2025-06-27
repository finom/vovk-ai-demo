import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TelegramRPC } from "vovk-client";

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  throw new Error("Missing environment variables");
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export default class TelegramService {
  // Helper function to download file from Telegram
  static async downloadTelegramFile(filePath: string): Promise<Buffer> {
    
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  // Helper function to send typing action
  static async sendTypingAction(chatId: number) {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`;
    await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        action: "typing",
      }),
    });
  }

  static async handle(request: NextRequest) {
    const update = await request.json();
    const chatId = update.message?.chat.id;

    if (!chatId) {
      return NextResponse.json({ success: true });
    }

    // Handle text messages
    if (update.message?.text) {
      const userMessage = update.message.text;

      // Show typing indicator
      await this.sendTypingAction(chatId);

      // Generate a response using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      });
      const botResponse =
        completion.choices[0].message.content ||
        "I couldn't generate a response.";

      // Send the response back to the user
      await TelegramRPC.sendMessage({
        body: {
            chat_id: chatId,
            text: botResponse,
        },
    });
      
    } else if (update.message?.voice) {
      try {
        // Show typing indicator
        await this.sendTypingAction(chatId);

        // Get file info from Telegram
        const { result: fileInfo } = await TelegramRPC.getFile({
            body: { file_id: update.message.voice.file_id },
        });

        // Download the voice file
        const voiceBuffer = await this.downloadTelegramFile(fileInfo.file_path!);

        // Create a File object for OpenAI
        const voiceFile = new File([voiceBuffer], "voice.ogg", {
          type: "audio/ogg",
        });

        // Transcribe the voice message using Whisper
        const transcription = await openai.audio.transcriptions.create({
          file: voiceFile,
          model: "whisper-1",
          language: "en", // You can remove this to auto-detect language
        });

        // Check if transcription is empty
        if (!transcription.text || transcription.text.trim() === "") {
            await TelegramRPC.sendMessage({
        body: {
            chat_id: chatId,
            text: "I couldn't understand the voice message. Please try again.",
        },
    });
          return NextResponse.json({ success: true });
        }

        // Generate a response using the transcribed text
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                'You are responding to a voice message. The user said: "' +
                transcription.text +
                '"',
            },
            { role: "user", content: transcription.text },
          ],
        });

        const botResponse =
          completion.choices[0].message.content ||
          "I couldn't generate a response.";

        // Send the response with transcription info
        const responseText = `🎤 I heard: "${transcription.text}"\n\n${botResponse}`;

        await TelegramRPC.sendMessage({
          body: {
            chat_id: chatId,
            text: responseText,
          },
        });
      } catch (voiceError) {
        console.error("Voice processing error:", voiceError);
        await TelegramRPC.sendMessage({
          body: {
            chat_id: chatId,
            text: "Sorry, I had trouble processing your voice message. Please try again or send a text message instead.",
          },
        });
      }
    } else {
      console.log("Received unsupported message type");
      await TelegramRPC.sendMessage({
        body: {
          chat_id: chatId,
          text: "Sorry, I can only process text and voice messages at the moment.",
        },
      });
    }

    return NextResponse.json({ success: true });
  }
}