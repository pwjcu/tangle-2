"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { OPEN_CHAT_EVENT } from "./AI열기";

type Message = { role: "user" | "guide"; text: string; ai?: boolean };

export default function ChatBot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedQuery, setFailedQuery] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const ko = language === "ko";
  const title = ko ? "탱글 AI 상담" : "Tangle AI guide";

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, open);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (query = input) => {
    const message = query.trim();
    if (!message || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 35000);
    setMessages((previous) => [...previous.slice(-39), { role: "user", text: message }]);
    setInput("");
    setFailedQuery("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, history: messages.slice(-6) }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string") throw new Error("Search unavailable");
      setMessages((previous) => [...previous, { role: "guide", text: data.reply, ai: data.source === "ai" }]);
    } catch {
      setFailedQuery(message);
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      setLoading(false);
    }
  };

  return <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-50 md:bottom-6 md:right-6 print:hidden">
    {isOpen && <section id="tangle-chat" aria-label={title} className="mb-3 flex h-[min(36rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[var(--color-silver-mist)] bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between bg-[#183e34] px-5 py-4 text-white">
        <div><p className="text-[10px] tracking-widest text-white/60">TANGLE AI</p><h2 className="mt-1 text-base font-semibold">{title}</h2></div>
        <button type="button" aria-label={t("chat.close")} onClick={() => { setIsOpen(false); toggleRef.current?.focus(); }} className="h-9 w-9 rounded-full hover:bg-white/10">✕</button>
      </div>
      <div ref={scrollRef} role="log" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-2xl bg-[#f0f7f3] p-4 text-sm leading-7">{ko ? "궁금한 시술이나 상담 내용을 적어 보세요. 탱글의 추천 메모와 공개 시술 가격을 바탕으로 답해요." : "Ask about treatments or clinics in Korea. Tangle uses its clinic notes and published reference prices."}</div>
        {messages.length === 0 && <div className="flex flex-wrap gap-2">{(ko ? ["코 재수술 병원 추천", "리쥬란 가격", "여드름 흉터 어디가 좋아요?", "써마지 회복 기간"] : ["Skin clinic for foreigners", "Rejuran price", "What to bring to a clinic"]).map((query) => <button key={query} onClick={() => void send(query)} disabled={loading} className="rounded-full border px-3 py-2 text-xs hover:bg-[#f0f7f3]">{query}</button>)}</div>}
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p className={"max-w-[94%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 " + (message.role === "user" ? "bg-[#183e34] text-white" : "border border-[#dce9e7] bg-white")}>
              {message.ai && <span className="mb-1 block text-[10px] font-bold tracking-wider text-[var(--accent)]">TANGLE AI</span>}
              {message.role === "user" ? message.text : message.text.split("\n").map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 && "\n"}
                  {/^\/prices\/(?:%[0-9a-f]{2}|[\w-])+$/i.test(line) ? (
                    <Link href={line} className="font-semibold text-[var(--brand)] underline underline-offset-4">{ko ? "규격별 가격과 원문 보기 →" : "Open prices and sources →"}</Link>
                  ) : line}
                </Fragment>
              ))}
            </p>
          </div>
        ))}
        {loading && <p role="status" className="text-xs text-stone-500">{t("chat.loading")}</p>}
        {failedQuery && <div role="alert" className="rounded-2xl bg-amber-50 p-3 text-sm"><p>{t("chat.error")}</p><button onClick={() => void send(failedQuery)} className="mt-2 font-semibold underline">{ko ? "다시 시도" : "Retry"}</button></div>}
      </div>
      <div className="shrink-0 border-t border-[#dce9e7] p-3">
        <div className="mb-3 flex gap-4 text-xs font-semibold"><Link href="/clinics">{ko ? "추천 목록" : "Seoul notes"} ↗</Link><Link href="/prices">{ko ? "가격표" : "Prices"} ↗</Link><Link href="/ai">{ko ? "AI 도구" : "AI tools"} ↗</Link></div>
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2">
          <input ref={inputRef} aria-label={ko ? "질문 입력" : "Your question"} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }} maxLength={2000} placeholder={ko ? "예: 코 재수술 상담 어디서 받을까요?" : "Ask Tangle AI"} className="field min-w-0 flex-1 !rounded-xl !py-2.5 !text-sm" />
          <button type="submit" disabled={loading || !input.trim()} aria-label={t("chat.send")} className="rounded-xl bg-[#183e34] px-4 text-white disabled:opacity-40">↑</button>
        </form>
        <p className="mt-2 text-[10px] leading-5 text-stone-500">{ko ? "질문은 답변을 위해 OpenAI로 전송되고 저장하지 않아요. 이름·연락처는 적지 마세요." : "Questions are sent to OpenAI to answer and are not stored. Do not include personal details."}</p>
      </div>
    </section>}
    <button ref={toggleRef} type="button" aria-label={isOpen ? t("chat.close") : title} aria-expanded={isOpen} aria-controls="tangle-chat" onClick={() => setIsOpen(!isOpen)} className="ml-auto flex h-12 items-center gap-2 rounded-full bg-[#183e34] px-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#245747] md:h-14 md:px-5"><span aria-hidden="true" className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold">AI</span><span className="hidden md:inline">{ko ? "탱글 AI 상담" : "Ask Tangle AI"}</span></button>
  </div>;
}
