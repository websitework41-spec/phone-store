'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Phone,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Package,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { sanitizeText } from '@/lib/security';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const FAQ_SUGGESTIONS = [
  { label: '📦 Open-Parcel COD', prompt: 'Explain the Open-Parcel Cash on Delivery policy.' },
  { label: '✅ Verify PTA DIRBS', prompt: 'How do I verify if my phone is PTA approved?' },
  { label: '💳 0% EMI Banks', prompt: 'Which banks offer 0% markup installments?' },
  { label: '🛡️ Brand Warranty', prompt: 'Where are the official warranty service centers?' },
  { label: '📱 Best under 40k', prompt: 'What are the best smartphones under 40,000 PKR?' },
  { label: '☎️ Human Support', prompt: 'How can I speak directly to customer support on WhatsApp?' },
];

// Helper to format basic markdown (bold, bullets, headings, links)
function FormattedBotMessage({ text }: { text: string }) {
  // Split into lines to handle headers and bullet lists
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3 or 2
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm mt-2 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#48afff] inline-block"></span>
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base mt-2.5 mb-1 text-[#136ab5] dark:text-[#48afff]">
              {trimmed.replace(/^##\s*/, '')}
            </h3>
          );
        }

        // Bullet point
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);
        const content = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');

        // Render inline formatting (bold, links, code)
        const renderInline = (str: string) => {
          // Replace markdown links [label](url)
          const linkRegex = /\[(.*?)\]\(([^\s)]+)\)/g;
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          let match;

          while ((match = linkRegex.exec(str)) !== null) {
            if (match.index > lastIndex) {
              parts.push(str.substring(lastIndex, match.index));
            }
            const label = match[1];
            const href = match[2];
            const isExternal = href.startsWith('http://') || href.startsWith('https://');

            parts.push(
              isExternal ? (
                <a
                  key={match.index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#136ab5] dark:text-[#48afff] font-semibold underline underline-offset-2 hover:text-[#136ab5] inline-flex items-center gap-0.5 mx-0.5"
                >
                  {label.replace(/\*\*/g, '')}
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              ) : (
                <Link
                  key={match.index}
                  href={href}
                  className="text-[#136ab5] dark:text-[#48afff] font-bold underline underline-offset-2 hover:text-[#136ab5] inline-flex items-center gap-0.5 mx-0.5"
                >
                  {label.replace(/\*\*/g, '')}
                </Link>
              )
            );
            lastIndex = linkRegex.lastIndex;
          }
          if (lastIndex < str.length) {
            parts.push(str.substring(lastIndex));
          }

          // Next process bold **text**
          return parts.map((part, pIdx) => {
            if (typeof part !== 'string') return part;
            const boldParts = part.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bp, bIdx) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return (
                  <strong key={`${pIdx}-${bIdx}`} className="font-bold text-slate-950 dark:text-white">
                    {bp.slice(2, -2)}
                  </strong>
                );
              }
              // Code snippet `code`
              if (bp.startsWith('`') && bp.endsWith('`') && bp.length > 2) {
                return (
                  <code key={`${pIdx}-${bIdx}`} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px] text-[#136ab5] dark:text-sky-300">
                    {bp.slice(1, -1)}
                  </code>
                );
              }
              return bp;
            });
          });
        };

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#48afff] font-bold text-xs mt-0.5">•</span>
              <span className="flex-1">{renderInline(content)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function HelperBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 **Welcome to Hamza Phone Store!**
I'm **HamzaBot**, your AI shopping specialist.

Ask me anything about:
- 📦 **Open-Parcel Cash on Delivery** (inspect before paying)
- ✅ **100% PTA Approved & DIRBS verification**
- 💳 **0% Markup Installment Plans** (Meezan, Alfalah, Faysal, Silkbank)
- 🛡️ **1-Year Official Brand Warranties**
- 📱 **Mobile recommendations & live prices**

Or tap a quick question below to get started!`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    const sanitized = sanitizeText(query, 500);

    if (!sanitized.trim() || isLoading) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: sanitized,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      // Build history payload for context
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sanitized,
          history: historyPayload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply =
        data?.reply ||
        "I'm here to help! You can ask about our smartphones, PTA approval, 0% EMI installments, or chat directly with our specialists on WhatsApp at +92 313 5221200!";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (!isAbort) {
        const errorMsg: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ I'm here to assist you! If you need instant live help, you can also reach us on WhatsApp at [+92 313 5221200](https://wa.me/923135221200).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setInputMessage('');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `👋 Chat reset! How can I assist you today with Hamza Phone Store smartphones or orders?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Launcher Button */}
      {!isOpen && (
        <aside
          aria-label="HamzaBot AI Assistant"
          className="fixed bottom-[76px] sm:bottom-[88px] right-5 sm:right-6 z-40 flex items-center"
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            aria-label="Ask HamzaBot AI Assistant"
            title="Ask HamzaBot AI - 24/7 Mobile Specialist"
            className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#0b3c68] via-[#136ab5] to-[#48afff] hover:brightness-110 text-white shadow-xl shadow-cyan-900/30 hover:shadow-cyan-900/50 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/40 group cursor-pointer"
          >
            {/* Ping indicator */}
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#48afff]"></span>
              </span>
            )}

            <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-200 group-hover:rotate-12" />
          </button>
        </aside>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <section
          aria-label="HamzaBot AI Chat Window"
          className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[410px] h-[580px] max-h-[90vh] rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white flex items-center justify-between border-b border-[#48afff]/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-[#48afff]/20 border border-white/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                    HamzaBot AI
                    <Sparkles className="w-3 h-3 text-[#48afff] fill-cyan-400/40" />
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#48afff]/20 text-sky-300 border border-[#48afff]/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  PTA • 0% EMI • Open-Parcel FAQ Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                aria-label="Reset conversation"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat window"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Helpline Ribbon */}
          <div className="px-3 py-1.5 bg-sky-50 dark:bg-cyan-950/40 border-b border-cyan-100 dark:border-cyan-900/30 flex items-center justify-between text-[11px]">
            <span className="text-cyan-950 dark:text-cyan-200 font-medium flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#136ab5] dark:text-[#48afff]" />
              Helpline: <strong className="font-bold">+92 313 5221200</strong>
            </span>
            <a
              href="https://wa.me/923135221200?text=Hi%20Hamza%20Phone%20Store!%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              WhatsApp Us
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <FormattedBotMessage text={msg.text} />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-white/70 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#48afff] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#48afff] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#48afff] animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                    HamzaBot is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {FAQ_SUGGESTIONS.map((faq, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(faq.prompt)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-cyan-950/50 hover:text-[#136ab5] dark:hover:text-[#48afff] text-slate-600 dark:text-slate-300 text-[11px] font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer disabled:opacity-50"
              >
                {faq.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about phones, PTA, EMI, Open-Parcel..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-transparent focus:border-[#48afff] focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer note */}
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-950 text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800">
            Powered by Google Gemini AI • Official Helpline: <strong>+92 313 5221200</strong>
          </div>
        </section>
      )}
    </>
  );
}
