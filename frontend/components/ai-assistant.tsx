"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
    { role: "ai", content: "Hello! I'm your Neural Assistant. I can summarize threads, help with posts, or explain community trends. How can I help today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", content: "I'm analyzing the current community signals for you. It looks like the 'technology' tag is trending with positive sentiment today!" }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                    <Bot size={18} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Neural Assistant</h3>
                  <p className="text-[10px] text-cyan-400/70">Online • AI v4.2</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-white/5 text-slate-200 border border-white/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-white/5 p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 transition-transform hover:scale-105 active:scale-95"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
          isOpen ? "bg-slate-800 text-white" : "bg-cyan-500 text-slate-950"
        }`}
      >
        {isOpen ? <ChevronDown size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </div>
  );
}
