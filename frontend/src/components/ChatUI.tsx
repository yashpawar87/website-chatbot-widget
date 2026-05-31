"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ExternalLink, Loader2 } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatUIProps {
  isWidget?: boolean;
}

export default function ChatUI({ isWidget = false }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const currentHistory = [...messages];
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Get API URL from env or localhost (Do NOT trust query parameters to prevent Open Redirect/Data Exfiltration)
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Remove trailing slash if exists
      apiUrl = apiUrl.replace(/\/$/, "");

      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          history: currentHistory.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#f8fafc] ${isWidget ? '' : 'max-w-4xl mx-auto shadow-sm border-x border-slate-200'}`}>
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-[#e34c26] shadow-sm z-10 rounded-t-xl">
        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white mr-4">
          <Bot size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-semibold text-white text-lg leading-tight">Website Assistant</h1>
          <p className="text-xs text-white/80 font-medium">Ask me anything about our site</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-70">
            <Bot size={48} className="text-blue-500 mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-slate-700 mb-2">How can I help you today?</h2>
            <p className="text-sm text-slate-500 max-w-xs">Ask me questions about the website content, services, or products.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[85%] sm:max-w-[80%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-end gap-2`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                  msg.role === "user" ? "bg-[#e34c26] text-white" : "bg-[#e34c26] text-white"
                }`}
              >
                {msg.role === "user" ? <User size={18} strokeWidth={1.5} /> : <Bot size={18} strokeWidth={1.5} />}
              </div>
              
              <div className="flex flex-col gap-1">
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#e34c26] text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-[#f8d3cc] rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Source Cards for Assistant */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#f8d3cc] rounded-full text-xs text-[#e34c26] hover:bg-[#fff0ed] transition-colors shadow-sm"
                        title={src.url}
                      >
                        <ExternalLink size={12} />
                        <span className="max-w-[150px] truncate font-medium">{src.title || src.url}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-end gap-2 max-w-[80%]">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#e34c26] text-white flex items-center justify-center shadow-sm">
                <Bot size={18} strokeWidth={1.5} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-[#f8d3cc] shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-[#e34c26]" size={18} />
                <span className="text-sm text-slate-500 font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100 max-w-sm text-center">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#f8d3cc] z-10">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            maxLength={500}
            className="w-full pl-5 pr-14 py-4 bg-white border border-[#f8d3cc] rounded-full focus:outline-none focus:ring-2 focus:ring-[#e34c26]/50 focus:border-[#e34c26] transition-all text-[15px] text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 rounded-full bg-[#94a3b8] text-white disabled:bg-slate-300 disabled:text-slate-500 hover:bg-[#64748b] transition-colors shadow-sm"
          >
            <Send size={18} className={input.trim() && !isLoading ? "translate-x-[1px]" : ""} />
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Assistant • Powered by RAG</span>
        </div>
      </div>
    </div>
  );
}
