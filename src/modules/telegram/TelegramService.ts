import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TelegramRPC } from "vovk-client";
import { createClient } from "redis";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const redis = createClient({
  url: process.env.REDIS_URL,
});

// Ensure Redis connection
redis.on("error", (err) => console.error("Redis Client Error", err));
redis.connect().catch(console.error);

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  throw new Error("Missing environment variables");
}

const apiRoot = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Constants for chat history
const MAX_HISTORY_LENGTH = 50;
const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default class TelegramService {
  // Helper function to get chat history key
  private static getChatHistoryKey(chatId: number): string {
    return `tg_chatbot:${chatId}:history`;
  }

  // Get chat history from Redis
  private static async getChatHistory(chatId: number): Promise<ChatMessage[]> {
    const key = this.getChatHistoryKey(chatId);
    const history = await redis.get(key);
    return history ? JSON.parse(history) : [];
  }

  // Save chat history to Redis
  private static async saveChatHistory(
    chatId: number,
    history: ChatMessage[],
  ): Promise<void> {
    const key = this.getChatHistoryKey(chatId);

    // Keep only the last MAX_HISTORY_LENGTH messages
    const trimmedHistory = history.slice(-MAX_HISTORY_LENGTH);

    await redis.set(key, JSON.stringify(trimmedHistory), {
      expiration: {
        type: "EX",
        value: HISTORY_TTL, // Set TTL to 7 days
      },
    });
  }

  // Add message to chat history
  private static async addToHistory(
    chatId: number,
    role: "user" | "assistant",
    content: string,
  ): Promise<void> {
    const history = await this.getChatHistory(chatId);
    history.push({
      role,
      content,
      timestamp: Date.now(),
    });
    await this.saveChatHistory(chatId, history);
  }

  // Convert chat history to OpenAI format
  private static formatHistoryForOpenAI(
    history: ChatMessage[],
  ): ChatCompletionMessageParam[] {
    return history.map(
      (msg) =>
        ({
          role: msg.role,
          content: msg.content,
        }) as const,
    );
  }

  // Helper function to download file from Telegram
  static async downloadTelegramFile(filePath: string): Promise<Buffer> {
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
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

      // Handle special commands
      if (userMessage === "/clear" || userMessage === "/start") {
        const key = this.getChatHistoryKey(chatId);
        await redis.del(key);
        await TelegramRPC.sendMessage({
          body: {
            chat_id: chatId,
            text:
              userMessage === "/clear"
                ? "Chat history cleared! 🧹"
                : "Hello! I'm your AI assistant. Send me a message or voice note to get started! 👋",
            parse_mode: "Markdown",
          },
          apiRoot,
        });
        return NextResponse.json({ success: true });
      }

      // Show typing indicator
      await TelegramRPC.sendChatAction({
        body: {
          chat_id: chatId,
          action: "typing",
        },
        apiRoot,
      });

      // Add user message to history
      await this.addToHistory(chatId, "user", userMessage);

      // Get chat history
      const history = await this.getChatHistory(chatId);
      const messages = this.formatHistoryForOpenAI(history);

      // Generate a response using OpenAI with context
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant in a Telegram chat. You have access to the conversation history to maintain context.",
          },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const botResponse =
        completion.choices[0].message.content ||
        "I couldn't generate a response.";

      // Add assistant response to history
      await this.addToHistory(chatId, "assistant", botResponse);

      // Send the response back to the user
      await TelegramRPC.sendMessage({
        body: {
          chat_id: chatId,
          text: botResponse,
          parse_mode: "Markdown",
        },
        apiRoot,
      });
    } else if (update.message?.voice) {
      try {
        await TelegramRPC.sendChatAction({
          body: {
            chat_id: chatId,
            action: "typing",
          },
          apiRoot,
        });

        // Get file info from Telegram
        const { result: fileInfo } = await TelegramRPC.getFile({
          body: { file_id: update.message.voice.file_id },
          apiRoot,
        });

        // Download the voice file
        const voiceBuffer = await this.downloadTelegramFile(
          fileInfo.file_path!,
        );

        // Create a File object for OpenAI
        const voiceFile = new File([voiceBuffer], "voice.ogg", {
          type: "audio/ogg",
        });

        // Transcribe the voice message using Whisper
        const transcription = await openai.audio.transcriptions.create({
          file: voiceFile,
          model: "whisper-1",
        });

        // Check if transcription is empty
        if (!transcription.text || transcription.text.trim() === "") {
          await TelegramRPC.sendMessage({
            body: {
              chat_id: chatId,
              text: "I couldn't understand the voice message. Please try again.",
              parse_mode: "Markdown",
            },
            apiRoot,
          });
          return NextResponse.json({ success: true });
        }

        // Add transcribed voice message to history
        await this.addToHistory(chatId, "user", transcription.text);

        // Get chat history
        const history = await this.getChatHistory(chatId);
        const messages = this.formatHistoryForOpenAI(history);

        // Generate a response using the transcribed text with context
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant in a Telegram chat. The user just sent a voice message. You have access to the conversation history to maintain context.",
            },
            ...messages,
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });

        const botResponse =
          completion.choices[0].message.content ||
          "I couldn't generate a response.";

        // Add assistant response to history
        await this.addToHistory(chatId, "assistant", botResponse);

        // Send the response with transcription info
        const responseText = `🎤 I heard: "${transcription.text}"\n\n${botResponse}`;

        await TelegramRPC.sendMessage({
          body: {
            chat_id: chatId,
            text: responseText,
            parse_mode: "Markdown",
          },
          apiRoot,
        });
      } catch (voiceError) {
        console.error("Voice processing error:", voiceError);
        await TelegramRPC.sendMessage({
          body: {
            chat_id: chatId,
            text: "Sorry, I had trouble processing your voice message. Please try again or send a text message instead.",
            parse_mode: "Markdown",
          },
          apiRoot,
        });
      }
    } else {
      console.error("Received unsupported message type");
      await TelegramRPC.sendMessage({
        body: {
          chat_id: chatId,
          text: "Sorry, I can only process text and voice messages at the moment.",
          parse_mode: "Markdown",
        },
        apiRoot,
      });
    }

    return NextResponse.json({ success: true });
  }
}
