import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { KnownAny } from "vovk";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
  voice?: {
    duration: number;
    file_id: string;
    file_unique_id: string;
    file_size?: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  messageId: number;
  isVoice?: boolean;
  transcription?: string;
}

// In-memory storage for conversation history (use Redis/Database in production)
const conversationHistory = new Map<number, ConversationMessage[]>();

// Helper function to send message to Telegram
async function sendTelegramMessage(chatId: string | number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  console.log('SENDING', {
      chat_id: chatId,
      text: text,
    });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });

  return response.json();
}

// Helper function to send voice message to Telegram
async function sendTelegramVoice(chatId: string | number, voiceBuffer: Buffer) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVoice`;

  const formData = new FormData();
  formData.append("chat_id", chatId.toString());
  formData.append(
    "voice",
    new Blob([voiceBuffer], { type: "audio/ogg" }),
    "voice.ogg",
  );

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

// Helper function to get file from Telegram
async function getTelegramFile(fileId: string) {
  const fileInfoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
  const fileInfoResponse = await fetch(fileInfoUrl);
  const fileInfo = await fileInfoResponse.json();

  if (!fileInfo.ok) {
    throw new Error("Failed to get file info");
  }

  const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`;
  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error("Failed to download file");
  }

  return fileResponse.arrayBuffer();
}

// Get conversation history for a chat
function getConversationHistory(chatId: number): ConversationMessage[] {
  return conversationHistory.get(chatId) || [];
}

// Add message to conversation history
function addToConversationHistory(
  chatId: number,
  message: ConversationMessage,
) {
  const history = getConversationHistory(chatId);
  history.push(message);

  // Keep only last 10 messages
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  conversationHistory.set(chatId, history);
}

// Get chat history from Telegram API
async function getChatHistory(
  chatId: number,
  limit: number = 10,
): Promise<TelegramMessage[]> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok || !data.result) {
      return [];
    }

    // Filter messages from the specific chat and get the last 'limit' messages
    const chatMessages = data.result
      .filter(
        (update: TelegramUpdate) =>
          update.message && update.message.chat.id === chatId,
      )
      .map((update: TelegramUpdate) => update.message!)
      .slice(-limit);

    return chatMessages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

// Process historical messages and build conversation context
async function buildConversationContext(
  chatId: number,
): Promise<ConversationMessage[]> {
  const existingHistory = getConversationHistory(chatId);

  // If we already have history, return it
  if (existingHistory.length > 0) {
    return existingHistory;
  }

  // Otherwise, fetch from Telegram API
  const chatHistory = await getChatHistory(chatId, 10);
  const contextMessages: ConversationMessage[] = [];

  for (const message of chatHistory) {
    if (message.text) {
      // Text message
      contextMessages.push({
        role: "user",
        content: message.text,
        timestamp: message.date,
        messageId: message.message_id,
        isVoice: false,
      });
    } else if (message.voice) {
      // Voice message - transcribe it
      try {
        const voiceBuffer = await getTelegramFile(message.voice.file_id);
        const audioFile = new File([voiceBuffer], "audio.ogg", {
          type: "audio/ogg",
        });

        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
        });

        contextMessages.push({
          role: "user",
          content: transcription.text,
          timestamp: message.date,
          messageId: message.message_id,
          isVoice: true,
          transcription: transcription.text,
        });
      } catch (error) {
        console.error("Error transcribing historical voice message:", error);
        // Add placeholder for failed transcription
        contextMessages.push({
          role: "user",
          content: "[Voice message - transcription failed]",
          timestamp: message.date,
          messageId: message.message_id,
          isVoice: true,
        });
      }
    }
  }

  // Store the built context
  conversationHistory.set(chatId, contextMessages);
  return contextMessages;
}

// Convert conversation history to OpenAI messages format
function formatConversationForOpenAI(
  history: ConversationMessage[],
): KnownAny[] {
  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant in a Telegram chat. You have access to the conversation history including transcribed voice messages.
      
      When a user asks for voice, audio, speech, or mentions wanting to hear something, respond with format: "VOICE_REQUEST: [your response text]"
      Otherwise, respond normally with text.
      
      Consider the conversation context when responding. Voice messages are transcribed and marked as such in the history.`,
    },
  ];

  // Add conversation history
  for (const msg of history) {
    messages.push({
      role: msg.role,
      content: msg.isVoice ? `[Voice message] ${msg.content}` : msg.content,
    });
  }

  return messages;
}

// Process text message with OpenAI and conversation context
async function processTextMessage(
  text: string,
  chatId: number,
): Promise<{ type: "text" | "voice"; content: string }> {
  try {
    const conversationContext = await buildConversationContext(chatId);
    const messages = formatConversationForOpenAI(conversationContext);

    // Add current message
    messages.push({
      role: "user",
      content: text,
    });

    console.log('messages', messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: messages,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not process your request.";

    // Add current user message to history
    addToConversationHistory(chatId, {
      role: "user",
      content: text,
      timestamp: Date.now(),
      messageId: Date.now(), // Use timestamp as messageId for new messages
      isVoice: false,
    });

    // Add assistant response to history
    const responseContent = response.startsWith("VOICE_REQUEST: ")
      ? response.replace("VOICE_REQUEST: ", "")
      : response;

    addToConversationHistory(chatId, {
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
      messageId: Date.now() + 1,
      isVoice: response.startsWith("VOICE_REQUEST: "),
    });

    if (response.startsWith("VOICE_REQUEST: ")) {
      const voiceText = response.replace("VOICE_REQUEST: ", "");
      return { type: "voice", content: voiceText };
    }

    return { type: "text", content: response };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      type: "text",
      content: "Sorry, I encountered an error processing your request.",
    };
  }
}

// Process voice message with OpenAI Whisper and conversation context
async function processVoiceMessage(
  voiceBuffer: ArrayBuffer,
  chatId: number,
): Promise<{ type: "text" | "voice"; content: string }> {
  try {
    // Convert ArrayBuffer to File object for OpenAI API
    const audioFile = new File([voiceBuffer], "audio.ogg", {
      type: "audio/ogg",
    });

    // Transcribe voice message using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    const transcribedText = transcription.text;

    // Get conversation context
    const conversationContext = await buildConversationContext(chatId);
    const messages = formatConversationForOpenAI(conversationContext);

    // Add current voice message
    messages.push({
      role: "user",
      content: `[Voice message] ${transcribedText}`,
    });

    // Process the transcribed text with GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not process your voice message.";

    // Add current user voice message to history
    addToConversationHistory(chatId, {
      role: "user",
      content: transcribedText,
      timestamp: Date.now(),
      messageId: Date.now(),
      isVoice: true,
      transcription: transcribedText,
    });

    // Add assistant response to history
    const responseContent = response.startsWith("VOICE_REQUEST: ")
      ? response.replace("VOICE_REQUEST: ", "")
      : response;

    addToConversationHistory(chatId, {
      role: "assistant",
      content: responseContent,
      timestamp: Date.now(),
      messageId: Date.now() + 1,
      isVoice: response.startsWith("VOICE_REQUEST: "),
    });

    if (response.startsWith("VOICE_REQUEST: ")) {
      const voiceText = response.replace("VOICE_REQUEST: ", "");
      return { type: "voice", content: voiceText };
    }

    return { type: "text", content: response };
  } catch (error) {
    console.error("Voice processing error:", error);
    return {
      type: "text",
      content: "Sorry, I could not process your voice message.",
    };
  }
}

// Generate speech using OpenAI TTS
async function generateSpeech(text: string): Promise<Buffer> {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();

    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;

    // Handle text messages
    if (message.text) {
      console.log(`Received text message from chat ${chatId}: ${message.text}`);

      const result = await processTextMessage(message.text, chatId);

      if (result.type === "text") {
        // Send text response to channel
        await sendTelegramMessage(
          TELEGRAM_CHANNEL_ID || chatId,
          result.content,
        );
      } else {
        // Generate and send voice response to channel
        const voiceBuffer = await generateSpeech(result.content);
        await sendTelegramVoice(TELEGRAM_CHANNEL_ID || chatId, voiceBuffer);
      }
    }

    // Handle voice messages
    else if (message.voice) {
      console.log(
        `Received voice message from chat ${chatId} with file_id: ${message.voice.file_id}`,
      );

      const voiceBuffer = await getTelegramFile(message.voice.file_id);
      const result = await processVoiceMessage(voiceBuffer, chatId);

      if (result.type === "text") {
        // Send text response to channel
        await sendTelegramMessage(
          TELEGRAM_CHANNEL_ID || chatId,
          result.content,
        );
      } else {
        // Generate and send voice response to channel
        const voiceBuffer = await generateSpeech(result.content);
        await sendTelegramVoice(TELEGRAM_CHANNEL_ID || chatId, voiceBuffer);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "Bot is running",
    timestamp: new Date().toISOString(),
    conversationCount: conversationHistory.size,
  });
}

// Endpoint to clear conversation history (for testing)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (chatId) {
    conversationHistory.delete(parseInt(chatId));
    return NextResponse.json({ message: `Cleared history for chat ${chatId}` });
  } else {
    conversationHistory.clear();
    return NextResponse.json({ message: "Cleared all conversation history" });
  }
}
