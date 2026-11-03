"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

type Message = { role: "user" | "guide"; text: string };

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
  const title = ko ? "탱글 정보 찾기" : "Tangle information guide";

  useEffect(() => () => requestRef.current?.abort(), []);
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
    const timeout = setTimeout(() => controller.abort(), 15000);
    setMessages((previous) => [...previous.slice(-39), { role: "user", text: message }]);
    setInput("");
    setFailedQuery("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string") throw new Error("Search unavailable");
      setMessages((previous) => [...previous, { role: "guide", text: data.reply }]);
    } catch {
      setFailedQuery(message);
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      setLoading(false);
    }
  };

  return <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
    {isOpen && <section id="tangle-chat" aria-label={title} className="mb-3 flex h-[min(36rem,calc(100dvh-7rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[var(--color-silver-mist)] bg-white shadow-2xl">
      <div className="flex shrink-0 items-center justify-between bg-[#183e34] px-5 py-4 text-white">
        <div><p className="text-[10px] tracking-widest text-white/60">TANGLE GUIDE</p><h2 className="mt-1 text-base font-semibold">{title}</h2></div>
        <button type="button" aria-label={t("chat.close")} onClick={() => { setIsOpen(false); toggleRef.current?.focus(); }} className="h-9 w-9 rounded-full hover:bg-white/10">✕</button>
      </div>
      <div ref={scrollRef} role="log" aria-live="polite" aria-relevant="additions" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-2xl bg-[#f0f7f3] p-4 text-sm leading-7">{ko ? "시술명이나 병원·원장 이름을 입력해 보세요. 등록된 서울 경험 추천과 참고 가격에서 찾아드려요. 실시간 검색·의료 진단은 제공하지 않습니다." : "Search registered Seoul experience notes and reference prices by treatment, clinic, or doctor. This guide does not provide live search or medical diagnosis."}</div>
        {messages.length === 0 && <div className="flex flex-wrap gap-2">{["리쥬란", "써마지", "여드름 흉터", "채선경"].map((query) => <button key={query} onClick={() => void send(query)} disabled={loading} className="rounded-full border px-3 py-2 text-xs hover:bg-[#f0f7f3]">{query}</button>)}</div>}
        {messages.map((message, index) => <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}><p className={"max-w-[94%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 " + (message.role === "user" ? "bg-[#183e34] text-white" : "border border-[#dce9e7] bg-white")}>{message.text}</p></div>)}
        {loading && <p role="status" className="text-xs text-stone-500">{t("chat.loading")}</p>}
        {failedQuery && <div role="alert" className="rounded-2xl bg-amber-50 p-3 text-sm"><p>{t("chat.error")}</p><button onClick={() => void send(failedQuery)} className="mt-2 font-semibold underline">{ko ? "다시 시도" : "Retry"}</button></div>}
      </div>
      <div className="shrink-0 border-t border-[#dce9e7] p-3">
        <div className="mb-3 flex gap-4 text-xs font-semibold"><Link href="/clinics">{ko ? "추천 목록" : "Seoul notes"} ↗</Link><Link href="/prices">{ko ? "가격표" : "Prices"} ↗</Link></div>
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2">
          <input ref={inputRef} aria-label={ko ? "시술·병원·원장 검색" : "Search treatments, clinics, doctors"} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }} maxLength={2000} placeholder={ko ? "시술·병원·원장 이름" : "Treatment, clinic, doctor"} className="field min-w-0 flex-1 !rounded-xl !py-2.5 !text-sm" />
          <button type="submit" disabled={loading || !input.trim()} aria-label={t("chat.send")} className="rounded-xl bg-[#183e34] px-4 text-white disabled:opacity-40">↑</button>
        </form>
        <p className="mt-2 text-[10px] leading-5 text-stone-500">{ko ? "사진 업로드·외부 AI 분석은 현재 제공하지 않아요." : "Photo upload and external AI analysis are unavailable."}</p>
      </div>
    </section>}
    <button ref={toggleRef} type="button" aria-label={isOpen ? t("chat.close") : title} aria-expanded={isOpen} aria-controls="tangle-chat" onClick={() => setIsOpen(!isOpen)} className="ml-auto flex h-14 items-center gap-2 rounded-full bg-[#183e34] px-5 text-sm font-semibold text-white shadow-lg hover:bg-[#245747]"><span aria-hidden="true">⌕</span>{ko ? "정보 찾기" : "Guide"}</button>
  </div>;
}
