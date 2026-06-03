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

// Onboarding Data configuration
const ONBOARDING_DATA = {
  greeting: "Hello! Welcome to Baellchen Technology. I can help you explore our advanced engineering solutions, check open career opportunities, or connect with our team. What brings you to our site today?",
  categories: [
    {
      title: "Explore Tech Solutions & Services",
      icon: "🛠️",
      description: "For clients & engineers evaluating our domain expertise.",
      options: [
        "What industrial automation and IoT solutions do you provide?",
        "Tell me about your AI, Deep Learning, and Computer Vision expertise.",
        "Do you offer automotive services like ADAS and ECU development?",
        "What solutions do you have for Biomedical Engineering or Solar Inverters?"
      ]
    },
    {
      title: "Careers & Job Opportunities",
      icon: "💼",
      description: "For job seekers and graduates looking to join our Pune office.",
      options: [
        "Are there any job openings for Junior Software Developers?",
        "What are the requirements for the Junior Software Tester role?",
        "How do I apply and where should I send my resume?"
      ]
    },
    {
      title: "Partner With Us & Company Info",
      icon: "🤝",
      description: "For business prospects evaluating a partnership or quote.",
      options: [
        "How can I get a quick quote for a project?",
        "How long will it take for someone to contact me after I send a request?",
        "Where is your office located, and what are your main contact emails?",
        "Do you operate as a service-based or a product-based company?"
      ]
    }
  ]
};

export default function ChatUI({ isWidget = false }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for toggling sources accordions (keyed by message index)
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  // State for the onboarding category tab (default to the first tab)
  const [expandedCategory, setExpandedCategory] = useState<number>(0);
  
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
      setExpandedCategory(0);
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
          <div className="flex flex-col items-center justify-start text-center px-2 animate-in fade-in duration-500 pb-10 min-h-full">
            <div className="w-16 h-16 bg-[#fff0ed] rounded-full flex items-center justify-center mb-4 shrink-0">
               <MessageSquareText size={32} className="text-[#e34c26]" />
            </div>
            
            <p className="text-[15px] leading-relaxed text-slate-600 mb-6 bg-white p-4 rounded-2xl border border-[#f8d3cc] shadow-sm text-left shrink-0">
              {ONBOARDING_DATA.greeting}
            </p>
            
            <div className="w-full max-w-full overflow-x-auto pb-3 pt-1 flex gap-2 scrollbar-hide justify-start sm:justify-center mb-4 shrink-0 px-1">
              {ONBOARDING_DATA.categories.map((category, idx) => {
                const isSelected = expandedCategory === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setExpandedCategory(idx)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm shrink-0 ${
                      isSelected 
                        ? 'bg-[#e34c26] text-white border border-[#e34c26]' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#f8d3cc]'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.title}
                  </button>
                );
              })}
            </div>
            
            <div className="w-full max-w-sm space-y-2 animate-in slide-in-from-bottom-2 duration-300 shrink-0">
               {ONBOARDING_DATA.categories[expandedCategory].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => submitQuestion(opt)}
                    className="w-full text-left p-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-[#e34c26] hover:text-[#e34c26] hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    {opt}
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
