import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  throw new Error('Missing environment variables');
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// POST handler for Telegram webhook
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Check if the update contains a text message
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userMessage = update.message.text;

      // Generate a response using OpenAI without context
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      });
      const botResponse = completion.choices[0].message.content;

      // Send the response back to the user via Telegram
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: botResponse,
        }),
      });
    } else {
      console.log('Received a non-text message');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}