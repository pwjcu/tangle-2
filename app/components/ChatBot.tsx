"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "bot",
      text: "안녕하세요. 시술 가격대, 회복 기간, 부작용처럼 비교에 필요한 정보를 먼저 정리해드릴게요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "일시적으로 답변을 불러오지 못했어요. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-4 flex h-[28rem] w-[21rem] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_25px_60px_rgba(27,21,18,0.18)] animate-fade-up">
          <div className="flex items-center justify-between bg-stone-950 px-4 py-4 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">tangle assistant</p>
              <span className="text-base font-bold">AI 상담 가이드</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbf8f5] p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-tr-none bg-stone-900 text-white"
                      : "rounded-tl-none border border-stone-200 bg-white text-stone-800 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-center text-xs text-stone-400">답변 정리 중...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-stone-200 bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder="예: 리프팅은 어느 예산대부터 봐야 해?"
              className="flex-1 rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-stone-900"
            />
            <button
              onClick={sendMessage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-stone-800"
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-2xl text-white shadow-[0_18px_36px_rgba(19,14,12,0.24)] transition-transform hover:scale-105 hover:bg-stone-800"
      >
        💬
      </button>
    </div>
  );
}
