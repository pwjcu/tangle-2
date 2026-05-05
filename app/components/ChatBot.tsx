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
        <div className="mb-4 flex h-[28rem] w-[21rem] flex-col overflow-hidden border border-[var(--color-carbon)] bg-[var(--color-paper)] animate-fade-up sm:w-[24rem]">
          <div className="flex items-center justify-between border-b border-[var(--color-carbon)] bg-[var(--color-carbon)] px-4 py-4 text-[var(--color-ghost-white)]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{t("chat.eyebrow")}</p>
              <span className="text-base font-bold">{t("chat.title")}</span>
            </div>
            <LanguageSwitcher compact />
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-fog-canvas)] p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] border p-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-[var(--color-carbon)] bg-[var(--color-carbon)] text-[var(--color-ghost-white)]"
                      : "border-[var(--color-carbon)] bg-[var(--color-paper)] text-[var(--color-carbon)]"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-center text-xs text-stone-400">{t("chat.loading")}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-[var(--color-carbon)] bg-[var(--color-paper)] p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder={t("chat.placeholder")}
              className="flex-1 border border-[var(--color-carbon)] bg-transparent px-3 py-2 text-sm outline-none focus:bg-white/30"
            />
            <button
              onClick={sendMessage}
              className="flex h-10 w-10 items-center justify-center bg-[var(--color-carbon)] text-[var(--color-ghost-white)] hover:bg-[var(--color-obsidian)]"
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center border border-[var(--color-carbon)] bg-[var(--color-carbon)] text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ghost-white)] hover:bg-[var(--color-obsidian)]"
      >
        AI
      </button>
    </div>
  );
}
