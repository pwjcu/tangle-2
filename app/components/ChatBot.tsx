"use client";

import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";

export default function ChatBot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "bot",
      text: t("chat.initial"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 1) return prev;

      return [{ role: "bot", text: t("chat.initial") }];
    });
  }, [language, t]);

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
        body: JSON.stringify({ message: userMessage, language }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("chat.error") },
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
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{t("chat.eyebrow")}</p>
              <span className="text-base font-bold">{t("chat.title")}</span>
            </div>
            <LanguageSwitcher compact />
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
            {loading && <div className="text-center text-xs text-stone-400">{t("chat.loading")}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-stone-200 bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder={t("chat.placeholder")}
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
