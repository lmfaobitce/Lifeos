"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Minimize2 } from "lucide-react";
import { sendAIMessage } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  hub?: string;
  initialMessage?: string;
  className?: string;
}

export function AIChat({ hub = "dashboard", initialMessage, className }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessage
      ? [{ role: "assistant", content: initialMessage }]
      : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const result = await sendAIMessage([...messages, userMsg], hub);
    if (result.success && result.message) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message! },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Try again." },
      ]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 bg-[#1C2B3A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1C2B3A]/90 transition-all"
        >
          <Sparkles className="w-5 h-5 text-[#C09240]" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className={cn(
          "fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-[#1C2B3A]/10 flex flex-col",
          className
        )} style={{ height: "480px" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1C2B3A] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C09240]" />
              <span className="text-[#F2EDE4] text-sm font-medium">LifeOS AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="text-[#9A8E7E] hover:text-[#F2EDE4] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center pt-8">
                <Sparkles className="w-8 h-8 text-[#C09240] mx-auto mb-3" />
                <p className="text-[#1C2B3A] font-medium text-sm">LifeOS AI</p>
                <p className="text-[#9A8E7E] text-xs mt-1">
                  Ask me about Ovier, fitness, goals, or anything on your mind.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#1C2B3A] text-[#F2EDE4] rounded-br-sm"
                      : "bg-[#F2EDE4] text-[#1C2B3A] rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F2EDE4] rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#9A8E7E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#9A8E7E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#9A8E7E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#1C2B3A]/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 text-sm bg-[#F2EDE4] rounded-xl px-3 py-2 text-[#1C2B3A] placeholder:text-[#9A8E7E] focus:outline-none focus:ring-2 focus:ring-[#1C2B3A]/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-9 h-9 bg-[#1C2B3A] rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#1C2B3A]/90 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
