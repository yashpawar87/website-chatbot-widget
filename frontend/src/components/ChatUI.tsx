"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Menu, RotateCw, Minus, Info, ArrowRight, ChevronDown, ChevronUp, Bot, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  quickReplies?: string[];
  timestamp?: Date;
}

interface ChatUIProps {
  isWidget?: boolean;
}

// Onboarding Data configuration
const ONBOARDING_DATA = {
  greeting: "Welcome to Baellchen Technology! How can I help you today?",
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

const formatTime = (date?: Date) => {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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

  const handleMinimize = () => {
    // Send a message to the parent window (widget.js) to close the iframe
    window.parent.postMessage('MINIMIZE_CHAT', '*');
  };

  const submitQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMessage: Message = { 
      role: "user", 
      content: questionText.trim(),
      timestamp: new Date()
    };
    const currentHistory = [...messages];
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
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
          quickReplies: data.quick_replies || [],
          timestamp: new Date()
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
    <div className={`flex flex-col h-full bg-white font-sans ${isWidget ? '' : 'max-w-4xl mx-auto shadow-sm border-x border-slate-200'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-10 rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <Menu size={20} strokeWidth={1.5} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 overflow-hidden rounded-full border border-slate-100">
              <Image 
                src="/company_logo.png" 
                alt="Logo" 
                fill 
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="font-semibold text-slate-800 text-[15px] tracking-tight">Baellchen Technology</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleReset}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Reset Conversation"
          >
            <RotateCw size={18} strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleMinimize}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Minimize Chat"
          >
            <Minus size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth bg-white">
        
        {/* Onboarding Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-start text-center px-2 animate-in fade-in duration-500 pb-10 min-h-full">
            <div className="w-16 h-16 relative overflow-hidden rounded-full mb-4 shrink-0 border border-slate-100 shadow-sm">
               <Image src="/company_logo.png" alt="Logo" fill className="object-cover" />
            </div>
            
            <p className="text-[15px] leading-relaxed text-slate-700 mb-8 max-w-lg text-center shrink-0">
              {ONBOARDING_DATA.greeting}
            </p>
            
            <div className="w-full max-w-full overflow-x-auto pb-3 pt-1 flex gap-2 scrollbar-hide justify-start sm:justify-center mb-4 shrink-0 px-1">
              {ONBOARDING_DATA.categories.map((category, idx) => {
                const isSelected = expandedCategory === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setExpandedCategory(idx)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.title}
                  </button>
                );
              })}
            </div>
            
            <div className="w-full max-w-md space-y-2 animate-in slide-in-from-bottom-2 duration-300 shrink-0">
               {ONBOARDING_DATA.categories[expandedCategory].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => submitQuestion(opt)}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg text-[15px] text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all"
                  >
                    {opt}
                  </button>
               ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col w-full animate-in fade-in duration-300">
            
            {msg.role === "user" ? (
              // User Message (Right aligned)
              <div className="flex flex-col items-end">
                <div className="text-xs text-slate-500 mb-1 px-1">
                  You {formatTime(msg.timestamp)}
                </div>
                <div className="bg-[#e5e7eb] text-slate-800 px-4 py-3 rounded-xl rounded-tr-sm max-w-[85%] text-[15px] leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              // Assistant Message (Left aligned)
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 relative overflow-hidden rounded-full shrink-0 border border-slate-100">
                    <Image src="/company_logo.png" alt="Avatar" fill className="object-cover" />
                  </div>
                  <span className="text-xs text-slate-500">
                    Baellchen Technology {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                <div className="pl-8 w-full max-w-[95%]">
                  {/* AI Assistant Pill */}
                  <div className="mb-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded border border-slate-200">
                      AI Assistant
                    </span>
                  </div>

                  <div className="text-[15px] text-slate-800 leading-relaxed mb-4 whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Sources Accordion */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 w-full max-w-lg border-t border-slate-200 pt-4">
                      <button 
                        onClick={() => toggleSource(idx)}
                        className="w-full flex items-center justify-between py-2 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800 text-[15px]">References</span>
                          <span className="px-2.5 py-0.5 bg-[#e0e8ff] text-[#0f62fe] text-xs font-semibold rounded-full">
                            {msg.sources.length}
                          </span>
                        </div>
                        {expandedSources[idx] ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                      </button>
                      
                      {expandedSources[idx] && (
                        <div className="mt-2 space-y-1">
                          {msg.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group"
                            >
                              <span className="text-[15px] text-[#0f62fe] truncate pr-4">{src.title || src.url}</span>
                              <ArrowRight size={18} className="text-[#0f62fe] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && idx === messages.length - 1 && !isLoading && (
                    <div className="mt-6 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-500">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => submitQuestion(reply)}
                          className="px-4 py-2 bg-white border border-[#0f62fe]/30 text-[#0f62fe] text-sm font-medium rounded-full hover:bg-[#e0e8ff] transition-all"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 relative overflow-hidden rounded-full shrink-0 border border-slate-100">
                <Image src="/company_logo.png" alt="Avatar" fill className="object-cover" />
              </div>
              <span className="text-xs text-slate-500">
                Baellchen Technology {formatTime(new Date())}
              </span>
            </div>
            <div className="pl-8 text-[15px] text-slate-600 animate-pulse">
              Just a moment while I gather information...
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 max-w-sm text-center">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 z-10 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center p-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
            disabled={isLoading}
            maxLength={500}
            className="w-full pl-3 pr-12 py-3 bg-white focus:outline-none text-[15px] text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
          >
            <Send size={20} strokeWidth={1.5} className={input.trim() && !isLoading ? "text-[#0f62fe]" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
