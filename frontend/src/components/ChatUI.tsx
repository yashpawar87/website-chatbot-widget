"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Menu, RotateCw, Minus, ArrowRight, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
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
  // State for toggling suggested quick replies
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});
  // State for the two-step onboarding category selection (null means show main menu)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
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

  const toggleReplies = (idx: number) => {
    setExpandedReplies(prev => ({
      ...prev,
      [idx]: true
    }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      setExpandedSources({});
      setExpandedReplies({});
      setSelectedCategory(null);
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
            <p className="text-[15px] leading-relaxed text-slate-600 mb-6 bg-white p-4 rounded-2xl border border-[#f8d3cc] shadow-sm text-left shrink-0">
              {ONBOARDING_DATA.greeting}
            </p>
            
            {selectedCategory === null ? (
              // Step 1: Main Categories
              <div className="w-full max-w-sm space-y-2.5 animate-in slide-in-from-bottom-2 duration-300 shrink-0">
                {ONBOARDING_DATA.categories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(idx)}
                    className="w-full flex items-center p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-[#e34c26] hover:shadow-md transition-all group active:scale-[0.98]"
                  >
                    <div className="text-xl mr-3 bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#fff0ed] transition-colors shadow-sm border border-slate-100 group-hover:border-[#f8d3cc]">
                      {category.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[14px] text-slate-800 group-hover:text-[#e34c26] transition-colors">{category.title}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 leading-snug">{category.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Step 2: Sub-Questions
              <div className="w-full max-w-sm flex flex-col animate-in slide-in-from-right-4 duration-300 shrink-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-slate-500 hover:text-[#e34c26] flex items-center gap-1 font-medium transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#f8d3cc] shadow-sm"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate ml-2">
                     {ONBOARDING_DATA.categories[selectedCategory].icon} {ONBOARDING_DATA.categories[selectedCategory].title}
                  </span>
                </div>
                
                <div className="space-y-2">
                   {ONBOARDING_DATA.categories[selectedCategory].options.map((opt, optIdx) => (
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
                <div className="w-full flex flex-col gap-2">
                  {/* Assistant Body Container */}
                  <div className="bg-[#fcfcfc] border border-slate-100 rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] w-full">
                    {/* AI Assistant Label */}
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        AI Assistant
                      </span>
                    </div>

                    <div className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {/* Sources Accordion inside the card */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <button 
                          onClick={() => toggleSource(idx)}
                          className="w-full flex items-center justify-between py-1 group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-600 text-[13px] group-hover:text-slate-800 transition-colors">Sources</span>
                            <span className="px-1.5 py-0.5 bg-slate-200/50 text-slate-500 text-[10px] font-bold rounded-sm">
                              {msg.sources.length}
                            </span>
                          </div>
                          {expandedSources[idx] ? <ChevronUp size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" /> : <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
                        </button>
                        
                        {expandedSources[idx] && (
                          <div className="mt-2 space-y-1">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between py-2 border-b border-slate-100/50 last:border-0 hover:bg-slate-100 transition-colors group px-2 rounded-md"
                              >
                                <span className="text-[13px] text-blue-600 truncate pr-4">{src.title || src.url}</span>
                                <ArrowRight size={14} className="text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons & Quick Replies (Only show for the very last assistant message) */}
                  {msg.role === "assistant" && idx === messages.length - 1 && !isLoading && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full bg-white/40 border border-slate-200/60 rounded-xl p-3 shadow-sm mt-1">
                      <span className="text-[12px] font-medium text-slate-600 mb-3 block text-center">Need help from our team or want to keep exploring?</span>
                      
                      {/* Fixed Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <a
                          href="https://baellchen.com/contact/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2.5 bg-[#e34c26]/90 text-white text-sm font-semibold rounded-xl hover:bg-[#e34c26] transition-all active:scale-[0.98] text-center shadow-sm"
                        >
                           Contact Us
                        </a>
                        
                        {(!msg.sources || msg.sources.length === 0) ? (
                          msg.quickReplies && msg.quickReplies.length > 0 ? null : (
                            <button
                              onClick={() => inputRef.current?.focus()}
                              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]"
                            >
                              Ask in a different way
                            </button>
                          )
                        ) : (
                          !expandedReplies[idx] && msg.quickReplies && msg.quickReplies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(idx)}
                              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
                            >
                              Explore related questions
                            </button>
                          )
                        )}
                      </div>

                      {/* LLM Generated Quick Replies */}
                      {(expandedReplies[idx] || (!msg.sources || msg.sources.length === 0)) && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-slate-100/60 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                            {msg.quickReplies.map((reply, i) => (
                              <button
                                key={i}
                                onClick={() => submitQuestion(reply)}
                                className="w-full sm:flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-[13px] font-medium rounded-xl hover:bg-white hover:border-[#e34c26]/40 hover:text-[#e34c26] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] text-left"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
