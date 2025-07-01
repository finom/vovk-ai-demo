import { NextRequest } from "next/server";
import OpenAI from "openai";
import { TelegramRPC } from "vovk-client";
import { createClient } from "redis";
import { openai as vercelOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText, jsonSchema, tool } from "ai";
import { CoreMessage } from "ai";
import { createLLMTools, KnownAny } from "vovk";
import UserController from "../user/UserController";
import TaskController from "../task/TaskController";
import { z } from "zod";

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

// Initialize OpenAI (only for voice transcription)
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

  // Convert chat history to Vercel AI SDK format
  private static formatHistoryForVercelAI(
    history: ChatMessage[],
  ): CoreMessage[] {
    return history.map(
      (msg): CoreMessage => ({
        role: msg.role,
        content: msg.content,
      }),
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

  // Send typing indicator
  private static async sendTypingIndicator(chatId: number): Promise<void> {
    await TelegramRPC.sendChatAction({
      body: {
        chat_id: chatId,
        action: "typing",
      },
      apiRoot,
    });
  }

  // Send message to user
  private static async sendMessage(
    chatId: number,
    text: string,
    messages: CoreMessage[],
  ): Promise<void> {
    const { object: { type, processedText } } = await generateObject({
      model: vercelOpenAI("gpt-4.1"),
      schema: z.object({
        type: z.enum(["text", "voice"]),
        processedText: z.string(),
      }),
      messages: [
        ...messages,
        {
          role: "system",
          content: 'Determine the type of response: "text" or "voice" depending on the user request. The processedText should be the text to send: if it\'s a text message, include it here, if it\'s a voice message, include the text that will be converted to speech.',
        },
      ],
    });

    console.log(' { type, processedText }:', { type, processedText });

    if (type === "voice") {
      await this.sendVoiceMessage(chatId, processedText);
    } else {
      await this.sendTextMessage(chatId, processedText);
    }
  }

  // Send message to user
  private static async sendTextMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    await TelegramRPC.sendMessage({
      body: {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      },
      apiRoot,
    });
  }

  private static async sendVoiceMessage(
    chatId: number,
    text: string,
  ): Promise<void> {
    try {
      // Generate speech from text using OpenAI TTS
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy", // You can change this to: alloy, echo, fable, onyx, nova, shimmer
        input: text,
        response_format: "opus", // Telegram supports opus format well
      });

      // Convert the response to a Buffer
      const voiceBuffer = Buffer.from(await speechResponse.arrayBuffer());

      // Send the voice message
      await TelegramRPC.sendVoice({
        body: {
          chat_id: chatId,
          voice: voiceBuffer.toString("base64"),
        },
        apiRoot,
      });
    } catch (error) {
      console.error("Error generating voice message:", error);
      // Fallback to text message if voice generation fails
      await this.sendTextMessage(chatId, text);
    }
  }

  // Generate AI response with conversation context using Vercel AI SDK
  private static async generateAIResponse(
    chatId: number,
    userMessage: string,
    systemPrompt: string,
  ): Promise<{ botResponse: string; messages: CoreMessage[] }> {
    // Add user message to history
    await this.addToHistory(chatId, "user", userMessage);

    // Get chat history
    const history = await this.getChatHistory(chatId);
    const messages = this.formatHistoryForVercelAI(history);
    const { tools } = createLLMTools({
      modules: {
        UserController,
        TaskController,
        // GithubIssuesRPC: [GithubIssuesRPC, githubOptions],
      },
      onExecute: (_d, { moduleName, handlerName }) =>
        console.log(`${moduleName}.${handlerName} executed`),
      onError: (e) => console.error("Error", e),
    });

    // Generate a response using Vercel AI SDK
    const { text } = await generateText({
      model: vercelOpenAI("gpt-4.1"),
      system: systemPrompt,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
      maxSteps: 20,
      tools: Object.fromEntries(
        tools.map(({ name, execute, description, parameters }) => [
          (console.log(name, parameters), name),
          tool<KnownAny, KnownAny>({
            execute,
            description,
            parameters: jsonSchema(parameters as KnownAny),
          }),
        ]),
      ),
    });

    const botResponse = text || "I couldn't generate a response.";

    // Add assistant response to history
    await this.addToHistory(chatId, "assistant", botResponse);

    messages.push({
      role: "assistant",
      content: botResponse,
    });

    return { botResponse, messages };
  }

  // Process user message (text or transcribed voice)
  private static async processUserMessage(
    chatId: number,
    userMessage: string,
    systemPrompt: string,
    responsePrefix?: string,
  ): Promise<void> {
    await this.sendTypingIndicator(chatId);

    const { botResponse, messages } = await this.generateAIResponse(
      chatId,
      userMessage,
      systemPrompt,
    );

    const finalResponse = responsePrefix
      ? `${responsePrefix}\n\n${botResponse}`
      : botResponse;

    await this.sendMessage(chatId, finalResponse, messages);
  }

  // Handle special commands
  private static async handleCommand(
    chatId: number,
    command: string,
  ): Promise<boolean> {
    if (command === "/clear" || command === "/start") {
      const key = this.getChatHistoryKey(chatId);
      await redis.del(key);

      const responseText =
        command === "/clear"
          ? "Chat history cleared! 🧹"
          : "Hello! I'm your AI assistant. Send me a message or voice note to get started! 👋";

      await this.sendTextMessage(chatId, responseText);
      return true;
    }
    return false;
  }

  // Process voice message
  private static async processVoiceMessage(
    chatId: number,
    fileId: string,
  ): Promise<void> {
    try {
      await this.sendTypingIndicator(chatId);

      // Get file info from Telegram
      const { result: fileInfo } = await TelegramRPC.getFile({
        body: { file_id: fileId },
        apiRoot,
      });

      // Download the voice file
      const voiceBuffer = await this.downloadTelegramFile(fileInfo.file_path!);

      // Create a File object for OpenAI
      const voiceFile = new File([voiceBuffer], "voice.ogg", {
        type: "audio/ogg",
      });

      // Transcribe the voice message using Whisper (still using OpenAI for this)
      const transcription = await openai.audio.transcriptions.create({
        file: voiceFile,
        model: "whisper-1",
      });

      // Check if transcription is empty
      if (!transcription.text || transcription.text.trim() === "") {
        await this.sendTextMessage(
          chatId,
          "I couldn't understand the voice message. Please try again.",
        );
        return;
      }

      // Process the transcribed message
      await this.processUserMessage(
        chatId,
        transcription.text,
        "You are a helpful assistant in a Telegram chat. The user just sent a voice message. You have access to the conversation history to maintain context. By default, you respond with voice, but if the user requests a text response, you can generate a text message.",
        `🎤 I heard the voice: "${transcription.text}"`,
      );
    } catch (voiceError) {
      console.error("Voice processing error:", voiceError);
      await this.sendTextMessage(
        chatId,
        "Sorry, I had trouble processing your voice message. Please try again or send a text message instead.",
      );
    }
  }

  static async handle(request: NextRequest) {
    const update = await request.json();
    const chatId = update.message?.chat.id;

    if (!chatId) {
      return { success: true };
    }

    // Handle text messages
    if (update.message?.text) {
      const userMessage = update.message.text;

      // Check if it's a command
      const isCommand = await this.handleCommand(chatId, userMessage);
      if (isCommand) {
        return { success: true };
      }

      // Process regular text message
      await this.processUserMessage(
        chatId,
        userMessage,
        "You are a helpful assistant in a Telegram chat. You have access to the conversation history to maintain context.",
      );
    }
    // Handle voice messages
    else if (update.message?.voice) {
      await this.processVoiceMessage(chatId, update.message.voice.file_id);
    }
    // Handle unsupported message types
    else {
      console.error("Received unsupported message type");
      await this.sendTextMessage(
        chatId,
        "Sorry, I can only process text and voice messages at the moment.",
      );
    }

    return { success: true };
  }
}
