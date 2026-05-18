"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  initialAnalysis: string;
  context: {
    businessType: string;
    targetCustomers: string;
    goals: string;
    constraints: string;
    additionalNotes: string;
  };
}

export default function Chat({ initialAnalysis, context }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, initialAnalysis, context }),
      });

      if (!response.ok || !response.body) throw new Error("Request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesHeight = isExpanded ? "h-[560px]" : "h-[320px]";

  return (
    <div className="bg-[#FDFAF6] border border-[#D0C4B8] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Image src="/logo-orange.png" alt="" width={20} height={20} />
          <span className="text-xs font-bold text-[#F2EDE4] uppercase tracking-widest">Ask the Ape</span>
          {messages.length > 0 && (
            <span className="text-xs text-[#A09590]">· {Math.ceil(messages.length / 2)} exchanges</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isMinimized}
            className="p-1.5 text-[#A09590] hover:text-[#F2EDE4] hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-30"
            title={isExpanded ? "Compress" : "Expand"}
          >
            {isExpanded ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-[#A09590] hover:text-[#F2EDE4] hover:bg-[#2a2a2a] rounded transition-colors"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className={`${messagesHeight} overflow-y-auto p-4 space-y-3 transition-all duration-300 bg-[#F7F3ED]`}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-[#111111] rounded-2xl flex items-center justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-orange.png" alt="" style={{ width: 68, height: 68, display: "block" }} />
                </div>
                <p className="text-[#0D0D0D] font-semibold text-sm mb-1">Ask the Ape anything</p>
                <p className="text-[#A09590] text-sm leading-relaxed">
                  Dig into any tactic, get specifics, or build a game plan for today.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-[#111111] text-[#F2EDE4] rounded-br-none"
                          : "bg-[#FDFAF6] border border-[#D0C4B8] rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="chat-markdown">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {isStreaming && i === messages.length - 1 && (
                            <span className="inline-block w-0.5 h-3.5 bg-[#E05C0A] animate-pulse ml-0.5 align-middle" />
                          )}
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#D0C4B8] p-3 flex gap-2 items-end bg-[#FDFAF6]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
              placeholder="Ask about a tactic, request specifics..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-[#F2EDE4] border border-[#D0C4B8] rounded px-3 py-2.5 text-sm text-[#0D0D0D] placeholder-[#A09590] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/20 disabled:opacity-50"
              style={{ minHeight: "40px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#E05C0A] text-white rounded hover:bg-[#B84500] disabled:bg-[#D0C4B8] disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
