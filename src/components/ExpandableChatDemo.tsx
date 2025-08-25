"use client";
import {
  Bot,
  Paperclip,
  Mic,
  CornerDownLeft,
  MoveDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { useEffect, useState } from "react";
import { useRegistry } from "@/registry";
import { DefaultChatTransport } from "ai";
import { Streamdown } from "streamdown";

export function ExpandableChatDemo() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/ai-sdk/function-calling",
    }),
    onToolCall: (toolCall) => {
      console.log("Tool call initiated:", toolCall);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  useEffect(() => {
    useRegistry.getState().parse(messages);
  }, [messages]);

  const handleAttachFile = () => {
    //
  };

  const handleMicrophoneClick = () => {
    //
  };

  return (
    <div className="h-[600px] relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={
          <div>
            <div className="absolute text-red-600 -left-18 -top-12 rotate-315 text-lg text-semibold">
              Chat Here
            </div>
            <MoveDownRight className="absolute text-red-600 scale-200 -left-4 -top-4" />
            <Bot className="h-6 w-6 scale-150" />
          </div>
        }
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <h1 className="text-xl font-semibold">AI-powered UI ✨</h1>
          <p className="text-sm text-muted-foreground">
            Tell it what you want to do: create user, assign tasks etc
          </p>
        </ExpandableChatHeader>
        <ExpandableChatBody>
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.role === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  }
                  fallback={message.role === "user" ? "US" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.role === "user" ? "sent" : "received"}
                >
                  {message.parts
                    .filter((part) => part.type === "text")
                    .map((part, index) => (
                      <Streamdown key={index}>{part.text}</Streamdown>
                    ))}
                  {status === "ready" &&
                    message.parts?.some(
                      (part) => part.type === "tool-invocation",
                    ) && (
                      <em className="block">Function executed successfully</em>
                    )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {status === "submitted" && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>
        {error && <div>❌ {error.message}</div>}
        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleAttachFile}
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleMicrophoneClick}
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  );
}
