"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Moon, Sun } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useTheme } from "next-themes";

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [message, setMessage] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { speak, cancel, speaking } = useSpeechSynthesis();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      handleInputChange({
        target: { value: transcript },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [transcript, handleInputChange]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (autoSpeak && lastMsg?.role === "assistant" && !speaking) {
      speak(lastMsg.content);
    }
  }, [messages, autoSpeak, speak, speaking]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isListening) stopListening();
    if (speaking) cancel();
    handleSubmit(e);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const renderMessageContent = (content: string) => {
    const parts = [];
    const jsonBlockRegex = /(.*?)(^json\s*\{[\s\S]*?\})(.*)/gm;
    let remainingContent = content;
    let match;

    while ((match = jsonBlockRegex.exec(remainingContent)) !== null) {
      if (match[1]) parts.push({ type: "text", content: match[1] });
      parts.push({ type: "code", content: match[2].replace(/^json\s*/, "") });
      remainingContent = match[3];
    }

    if (remainingContent)
      parts.push({ type: "text", content: remainingContent });

    return parts.map((part, index) =>
      part.type === "code" ? (
        <pre
          key={index}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto my-2 font-mono"
        >
          <code>{part.content}</code>
        </pre>
      ) : (
        <p key={index} className="whitespace-pre-wrap mb-2">
          {part.content}
        </p>
      )
    );
  };

  return (
    <div className="flex flex-col w-full max-w-screen-lg mx-auto h-screen text-sm">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          GPT-Clone
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isMounted &&
              (theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              ))}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 md:hidden">
              <img
                src="/mic.png"
                className="h-24 w-24 "
                alt=""
                onClick={isListening ? stopListening : startListening}
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              How can I help you today?
            </h2>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm ${msg.role === "user"
                  ? "bg-[#2e63d2] text-white"
                  : "bg-[#e8e8ea] dark:bg-[#444654] text-black dark:text-white"
                  }`}
              >
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </main>

      <div className="p-4 bg-white dark:bg-[#40414f] border-t border-gray-300 dark:border-gray-700">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
          <Card className="flex-1 flex items-center p-2 bg-[#f7f7f8] dark:bg-[#343541] border-0">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Send a message..."
              className="flex-1 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {browserSupportsSpeechRecognition && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </Card>
          <Button
            type="button"
            variant={autoSpeak ? "default" : "outline"}
            size="icon"
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? "Turn off auto-speak" : "Turn on auto-speak"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </Button>
        </form>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          GPT-Clone may produce inaccurate information. Always verify important details.
        </p>
      </div>
    </div>
  );
}
