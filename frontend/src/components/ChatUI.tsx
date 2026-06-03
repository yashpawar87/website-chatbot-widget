"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, ExternalLink, Loader2, Trash2, ChevronDown, ChevronUp, MessageSquareText } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  quickReplies?: string[];
}

interface ChatUIProps {
  isWidget?: boolean;
}

// Starter Categories configuration
const STARTER_CATEGORIES = [
  {
    title: "Services & Pricing",
    icon: "💰",
    question: "Can you tell me about your services and pricing?"
  },
  {
    title: "About Us",
    icon: "🏢",
    question: "What is the background and mission of the company?"
  },
  {
    title: "Support & Contact",
    icon: "📞",
    question: "How do I get in touch with human support?"
  }
];

export default function ChatUI({ isWidget = false }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for toggling sources accordions (keyed by message index)
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, expandedSources]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const toggleSource = (idx: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      setExpandedSources({});
      setError(null);
    }
  };

  const submitQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: questionText.trim() };
    const currentHistory = [...messages];
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Get API URL from env or localhost (Do NOT trust query parameters)
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
          quickReplies: data.quick_replies || []
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(input);
  };

  return (
    <div className={`flex flex-col h-full bg-[#f8fafc] ${isWidget ? '' : 'max-w-4xl mx-auto shadow-sm border-x border-slate-200'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#e34c26] shadow-sm z-10 rounded-t-xl">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white mr-4">
            <Bot size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-semibold text-white text-lg leading-tight">Website Assistant</h1>
            <p className="text-xs text-white/80 font-medium">Just a moment while I gather information...</p>
          </div>
        </div>
        
        {/* Reset Conversation Button */}
        {messages.length > 0 && (
          <button 
            onClick={handleReset}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Reset Conversation"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        
        {/* Onboarding Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-[#fff0ed] rounded-full flex items-center justify-center mb-6">
               <MessageSquareText size={32} className="text-[#e34c26]" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome! 👋</h2>
            <p className="text-slate-500 mb-8 max-w-sm">I'm here to help you navigate our website and find the information you need.</p>
            
            <div className="w-full max-w-sm space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left pl-2 mb-2">Select a topic to start</p>
              {STARTER_CATEGORIES.map((category, idx) => (
                <button
                  key={idx}
                  onClick={() => submitQuestion(category.question)}
                  className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-[#e34c26] hover:shadow-md transition-all group text-left"
                >
                  <span className="text-2xl mr-4">{category.icon}</span>
                  <span className="font-medium text-slate-700 group-hover:text-[#e34c26] transition-colors">{category.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`flex max-w-[90%] sm:max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-end gap-2`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                  msg.role === "user" ? "bg-[#e34c26] text-white" : "bg-[#e34c26] text-white"
                }`}
              >
                {msg.role === "user" ? <User size={16} strokeWidth={1.5} /> : <Bot size={16} strokeWidth={1.5} />}
              </div>
              
              <div className="flex flex-col gap-1 w-full">
                <div
                  className={`px-4 py-3 shadow-sm text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#e34c26] text-white rounded-2xl rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Sources Accordion */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleSource(idx)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink size={14} className="text-[#e34c26]" />
                        <span>Sources & References ({msg.sources.length})</span>
                      </div>
                      {expandedSources[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    {expandedSources[idx] && (
                      <div className="px-3 py-2 border-t border-slate-100 bg-white space-y-2">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-[#e34c26] hover:underline truncate"
                          >
                            {src.title || src.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Replies Buttons (Only show for the very last assistant message) */}
            {msg.role === "assistant" && msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && !isLoading && (
              <div className="mt-4 pl-10 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {msg.quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => submitQuestion(reply)}
                    className="px-4 py-2 bg-white border border-[#e34c26]/30 text-[#e34c26] text-sm font-medium rounded-full hover:bg-[#fff0ed] hover:border-[#e34c26] transition-all shadow-sm active:scale-95"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-end gap-2 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e34c26] text-white flex items-center justify-center shadow-sm">
                <Bot size={16} strokeWidth={1.5} />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 h-[46px]">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100 max-w-sm text-center shadow-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 z-10 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            maxLength={500}
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e34c26]/50 focus:border-[#e34c26] transition-all text-[15px] text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 rounded-full bg-[#e34c26] text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-[#c94120] transition-colors shadow-sm"
          >
            <Send size={18} className={input.trim() && !isLoading ? "translate-x-[1px]" : ""} />
          </button>
        </form>
        <div className="text-center mt-3">
          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <Bot size={12} />
            AI Assistant powered by RAG. May occasionally make mistakes.
          </span>
        </div>
      </div>
    </div>
  );
}
