"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicPriceSummary } from "@/lib/공개시술가격";

const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

export default function PublicPriceList({ items }: { items: PublicPriceSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = [...new Set(items.map((item) => item.category))];
  const terms = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  const visible = items.filter((item) => {
    const index = [item.name, ...item.aliases, ...item.variants].map(normalize);
    return (!category || item.category === category) && terms.every((term) => index.some((value) => value.includes(term)));
  });

  return (
    <section aria-labelledby="recent-prices-title" className="grid min-w-0 gap-5">
      <div>
        <h2 id="recent-prices-title" className="type-section">서울 병원 공개 가격</h2>
        <p className="type-copy mt-2">시술을 선택하면 규격별 가격과 병원 원문을 확인할 수 있어요.</p>
      </div>
      <div className="rounded-[20px] border border-[var(--color-silver-mist)] bg-white p-4 sm:p-5">
        <label htmlFor="public-price-search" className="mb-2 block text-sm font-semibold">시술명이나 규격 검색</label>
        <input id="public-price-search" type="search" placeholder="예시 · 리쥬란 2cc, 써마지 600샷" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-[var(--color-silver-mist)] bg-[var(--cream)] px-4 py-3 text-base" />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="시술 분야">
          {["", ...categories].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              aria-pressed={value === category}
              className={`rounded-full border px-3 py-2 text-sm font-medium ${value === category ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--color-silver-mist)] hover:border-[var(--brand)]"}`}
            >
              {value || "전체"}
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="text-sm text-[var(--color-muted)]">{visible.length}개 시술</p>
      {visible.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
          {visible.map(({ name, category: type, variants, preview }) => (
            <li key={name}>
              <Link href={`/prices/${encodeURIComponent(name)}`} className="flex h-full flex-col gap-2 rounded-2xl border border-[var(--color-silver-mist)] bg-white p-4 hover:border-[var(--brand)] sm:p-5">
                <span className="text-xs font-medium text-[var(--color-muted)]">{type}</span>
                <span className="text-lg font-bold text-[var(--brand)]">{name} <span aria-hidden="true">→</span></span>
                {preview ? (
                  <span className="mt-auto grid gap-0.5"><strong className="text-sm">{preview.price}</strong><span className="text-xs leading-5 text-[var(--color-muted)]">{preview.label}</span></span>
                ) : (
                  <span className="mt-auto text-xs leading-5 text-[var(--color-muted)]">{variants.length}개 규격 · 적용 조건 확인</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-silver-mist)] p-6 text-sm text-[var(--color-muted)]">
          해당 시술의 11월 공개 가격 표본이 없습니다. <a href="#price-archive" className="font-semibold text-[var(--brand)] underline underline-offset-4">이전 가격 자료 가기</a>
        </div>
      )}
    </section>
  );
}
