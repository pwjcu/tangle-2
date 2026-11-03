"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  clinicCategoryLabels,
  clinicRecommendationMeta,
  clinicRecommendations,
  clinicStatusLabels,
  getClinicRecommendations,
  type ClinicCategory,
  type ClinicRecommendation,
  type ClinicStatus,
} from "@/lib/서울경험추천";

const SAVED_KEY = "tangle:clinic-saved:v1";
const SAVED_EVENT = "tangle:clinic-saved-change";
let memorySaved = "[]";
let useMemoryStorage = false;

function subscribeSaved(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SAVED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SAVED_EVENT, callback);
  };
}
function savedSnapshot() {
  if (useMemoryStorage) return memorySaved;
  try { return window.localStorage.getItem(SAVED_KEY) ?? "[]"; }
  catch { return memorySaved; }
}
function readSavedIds(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id): id is string => typeof id === "string" && clinicRecommendations.some((item) => item.id === id)))]
      : [];
  } catch { return []; }
}

const statusStyles: Record<ClinicStatus, string> = {
  experience: "border-[#d3e6df] bg-[#eef7f1] text-[#285c48]",
  confirm: "border-[#eadbb9] bg-[#fff8e7] text-[#7e5b1f]",
  insufficient: "border-slate-200 bg-slate-50 text-slate-600",
  withheld: "border-[#e1d9ed] bg-[#f5f1fa] text-[#685682]",
};

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4V4Z" /></svg>;
}

export default function ClinicRecommendationsList() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const rawCategory = params.get("category") ?? "all";
  const category: ClinicCategory | "all" = rawCategory in clinicCategoryLabels ? rawCategory as ClinicCategory : "all";
  const rawStatus = params.get("status") ?? "all";
  const status: ClinicStatus | "all" = rawStatus in clinicStatusLabels ? rawStatus as ClinicStatus : "all";
  const savedOnly = params.get("saved") === "1";
  const focusedId = params.get("item");
  const serializedSaved = useSyncExternalStore(subscribeSaved, savedSnapshot, () => "[]");
  const savedIds = useMemo(() => readSavedIds(serializedSaved), [serializedSaved]);
  const [message, setMessage] = useState("");
  const [shareFallback, setShareFallback] = useState("");
  const filtered = getClinicRecommendations(query, category, status).filter((item) =>
    (!savedOnly || savedIds.includes(item.id)) && (!focusedId || item.id === focusedId),
  );

  function updateFilters(values: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    next.delete("item");
    for (const [key, value] of Object.entries(values)) {
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
    }
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  function toggleSaved(item: ClinicRecommendation) {
    const wasSaved = savedIds.includes(item.id);
    const next = wasSaved ? savedIds.filter((id) => id !== item.id) : [...savedIds, item.id];
    memorySaved = JSON.stringify(next);
    try {
      window.localStorage.setItem(SAVED_KEY, memorySaved);
      useMemoryStorage = false;
      setMessage(wasSaved ? `${item.title} 저장을 해제했습니다.` : `${item.title} 항목을 이 브라우저에 저장했습니다.`);
    } catch {
      useMemoryStorage = true;
      setMessage("브라우저 저장이 제한되어 이번 방문 동안만 보관합니다. 페이지를 새로 열면 사라질 수 있습니다.");
    }
    window.dispatchEvent(new Event(SAVED_EVENT));
  }

  async function share(item?: ClinicRecommendation) {
    setShareFallback("");
    const url = new URL(pathname, window.location.origin);
    if (item) url.searchParams.set("item", item.id);
    else {
      if (query) url.searchParams.set("q", query);
      if (category !== "all") url.searchParams.set("category", category);
      if (status !== "all") url.searchParams.set("status", status);
    }
    const title = item ? `탱글 서울 경험 추천 · ${item.title}` : "탱글 서울 경험 추천";
    try {
      if (navigator.share) {
        await navigator.share({ title, text: "개인 경험 참고 목록 · 병원명·소속·운영 여부 외부 검증 전", url: url.href });
        return;
      }
      if (!navigator.clipboard) throw new Error("clipboard-unavailable");
      await navigator.clipboard.writeText(url.href);
      setMessage("링크를 복사했습니다. 개인 저장 목록은 공유 링크에 포함되지 않습니다.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareFallback(url.href);
      setMessage("자동 공유를 사용할 수 없습니다. 아래 링크를 선택해 복사해 주세요.");
    }
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="border-b border-[#dce8e2] bg-white/90">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.06em] text-[#244e3e]" aria-label="탱글 홈">tangle<span className="text-[#8caa80]">.</span></Link>
          <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/clinics" aria-current="page" className="rounded-full bg-[#edf4ec] px-4 py-2 font-semibold text-[#294f3e]">서울 경험 추천</Link>
            <Link href="/prices" className="ghost-link">가격 참고표</Link>
            <Link href="/recommend" className="ghost-link">시술 탐색</Link>
          </nav>
        </div>
      </header>

      <section className="shell pb-10 pt-10 sm:pb-14 sm:pt-16" aria-labelledby="clinic-title">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#4a705d]"><span className="h-2 w-2 rounded-full bg-[#6b9277]" /> SEOUL · EXPERIENCE NOTES</p>
            <h1 id="clinic-title" className="text-[2.4rem] font-semibold !leading-[1.18] text-[#243f33] sm:text-6xl">어디서, 누구에게.<br /><span className="text-[#75947a]">경험에서 찾는 단서.</span></h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#637066] sm:text-base">지인에게 공유하던 서울 시술별 병원·의료진 메모.<br className="hidden sm:block" /> 시술명, 원장 이름, 기억 속 병원까지 한곳에서 찾아보세요.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[#53665b]">
              <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">서울 한정</span>
              <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">25개 시술·관리 항목</span>
              <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">원문 포함</span>
            </div>
          </div>
          <aside className="rounded-[28px] border border-[#dce5d4] bg-[#f2f5e9] p-6 sm:p-7" aria-label="추천 정보의 출처와 범위">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#69805c]">이 목록을 읽는 방법</p>
            <h2 className="mt-3 text-xl font-semibold !leading-snug text-[#364c35]">경험은 참고하고,<br />현재 정보는 확인해 주세요.</h2>
            <p className="mt-3 text-sm leading-6 text-[#677261]">{clinicRecommendationMeta.scope_note}</p>
            <details className="mt-4 border-t border-[#d9e1cf] pt-4 text-sm text-[#56654e]">
              <summary className="cursor-pointer font-semibold">출처와 확인 범위 보기</summary>
              <div className="mt-3 space-y-3 text-[13px] leading-6">
                <p>{clinicRecommendationMeta.source_claim}</p>
                <p>{clinicRecommendationMeta.notice}</p>
                <p>자료 접수: 2026년 10월 29일 · 경험 시점 미상<br />표시 순서는 원문 순서이며 평가 순위가 아닙니다.</p>
              </div>
            </details>
          </aside>
        </div>
      </section>

      <section className="shell" aria-labelledby="search-heading">
        <div className="rounded-[28px] border border-[#dce8df] bg-white p-5 shadow-[0_12px_40px_rgba(35,68,49,0.04)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="search-heading" className="text-lg font-semibold !leading-snug text-[#304a3a]">찾고 싶은 시술이나 이름이 있나요?</h2>
            <button type="button" onClick={() => void share()} className="rounded-full border border-[#dce5da] px-4 py-2 text-xs font-semibold text-[#48654f] hover:bg-[#f4f7ef]">검색 결과 공유 ↗</button>
          </div>
          <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); updateFilters({ q: String(data.get("q") ?? "").trim() }); }}>
            <label htmlFor="clinic-search" className="sr-only">시술, 병원, 원장 이름 검색</label>
            <input key={query} id="clinic-search" name="q" type="search" defaultValue={query} maxLength={100} placeholder="예: 리쥬란, 김창식, 창피부과" className="min-w-0 flex-1 rounded-2xl border border-[#dce5da] bg-[#fafcf8] px-4 py-3 text-sm outline-none focus:border-[#719579] focus:ring-2 focus:ring-[#dce9d9]" />
            <button className="rounded-2xl bg-[#315640] px-5 py-3 text-sm font-semibold text-white hover:bg-[#244530]" type="submit">검색</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="분야별 필터">
            {(["all", "skin", "surgery", "body"] as const).map((value) => <button key={value} type="button" aria-pressed={category === value} onClick={() => updateFilters({ category: value })} className={`rounded-full border px-4 py-2 text-sm font-medium ${category === value ? "border-[#315640] bg-[#315640] text-white" : "border-[#e0e6db] text-[#647160] hover:bg-[#f3f6ee]"}`}>{value === "all" ? "전체" : clinicCategoryLabels[value]}<span className="ml-2 text-xs opacity-70">{value === "all" ? clinicRecommendations.length : clinicRecommendations.filter((item) => item.category === value).length}</span></button>)}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#edf0e9] pt-4">
            <label htmlFor="clinic-status" className="text-xs font-medium text-[#6c7968]">정보 상태</label>
            <select id="clinic-status" value={status} onChange={(event) => updateFilters({ status: event.target.value })} className="rounded-lg border border-[#e0e6db] bg-white px-3 py-2 text-sm text-[#4c604d]">
              <option value="all">모든 상태</option>
              {Object.entries(clinicStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="button" aria-pressed={savedOnly} onClick={() => updateFilters({ saved: savedOnly ? null : "1" })} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${savedOnly ? "border-[#78987a] bg-[#eff5e8] text-[#315640]" : "border-[#e0e6db] text-[#647160]"}`}><BookmarkIcon filled={savedOnly} /> 저장한 항목 <span>{savedIds.length}</span></button>
            {(query || category !== "all" || status !== "all" || savedOnly || focusedId) && <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold text-[#6c7968] underline underline-offset-4">필터 초기화</button>}
          </div>
        </div>

        <div className="mt-4 min-h-6 text-sm text-[#405b45]" role="status" aria-live="polite">{message}</div>
        {shareFallback && <div className="mb-4 rounded-xl border border-[#dce5da] bg-white p-4"><label htmlFor="clinic-share-link" className="block text-sm font-medium">공유 링크</label><input id="clinic-share-link" readOnly value={shareFallback} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full rounded-lg border border-[#dce5da] p-3 text-sm" /><button type="button" onClick={() => setShareFallback("")} className="mt-2 text-sm underline">닫기</button></div>}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm font-medium text-[#42573f]" aria-live="polite">{query ? `“${query}” 검색 결과` : focusedId ? "공유된 항목" : savedOnly ? "저장한 항목" : "추천 메모"} <strong className="ml-1 text-lg">{filtered.length}</strong><span className="ml-1 text-[#7c8778]">개</span></p>
          <p className="text-xs text-[#788373]">모든 항목 외부 검증 전 · 저장은 현재 브라우저에만 적용</p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#cfdcc9] bg-white/60 px-6 py-16 text-center">
            <h3 className="text-xl font-semibold !leading-snug text-[#42573f]">조건에 맞는 메모가 없습니다.</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#71806b]">{savedOnly ? "관심 있는 항목의 저장 버튼을 눌러 나만의 목록을 만들어 보세요." : "시술명이나 이름을 짧게 입력하거나 필터를 초기화해 보세요. 목록에 없는 정보를 임의로 추천하지 않습니다."}</p>
            <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="mt-6 rounded-full bg-[#315640] px-6 py-3 text-sm font-semibold text-white">전체 25개 항목 보기</button>
          </div>
        ) : (
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => {
              const isSaved = savedIds.includes(item.id);
              return <article key={item.id} id={item.id} aria-labelledby={`title-${item.id}`} className="overflow-hidden rounded-[24px] border border-[#dde6da] bg-white shadow-[0_5px_25px_rgba(45,70,40,0.03)]">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-semibold text-[#7b8b73]">{clinicCategoryLabels[item.category]}</span><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusStyles[item.status]}`}>{clinicStatusLabels[item.status]}</span></div>
                    <button type="button" onClick={() => toggleSaved(item)} aria-label={`${item.title} ${isSaved ? "저장 해제" : "저장"}`} aria-pressed={isSaved} className={`-mr-2 -mt-2 shrink-0 rounded-full p-2.5 ${isSaved ? "bg-[#f0f5e9] text-[#507744]" : "text-[#929f89] hover:bg-[#f5f7f0]"}`}><BookmarkIcon filled={isSaved} /></button>
                  </div>
                  <h3 id={`title-${item.id}`} className="mt-4 text-xl font-semibold !leading-snug text-[#31492e]">{item.title}</h3>
                  <div className="mt-5 space-y-4">
                    {item.providers.map((provider, index) => <div key={`${provider.clinic}-${index}`} className={index ? "border-t border-[#eef1e9] pt-4" : ""}>
                      <p className="text-[15px] font-semibold text-[#3f5138]">{provider.clinic ?? "병원명 미확인"}</p>
                      <p className="mt-1 text-sm text-[#65725c]">{provider.doctors.length ? provider.doctors.map((name) => `${name} 님`).join(" · ") : "담당자 이름 미기재"}</p>
                      {provider.location_hint && <p className="mt-2 text-xs leading-5 text-[#829078]">지역 단서: {provider.location_hint}</p>}
                      {provider.note && <p className="mt-2 text-xs leading-5 text-[#829078]">{provider.note}</p>}
                      {provider.clinic && <a href={`https://map.naver.com/p/search/${encodeURIComponent(`서울 ${provider.clinic} ${provider.location_hint ?? ""}`.trim())}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded-md py-1 text-xs font-medium text-[#507045] underline decoration-[#b2c2a6] underline-offset-4" aria-label={`${provider.clinic} 지도에서 이름 검색, 새 창`}>지도에서 이름 검색 ↗</a>}
                    </div>)}
                    {item.note && <p className={`rounded-xl px-3 py-3 text-xs leading-6 ${item.providers.length ? "bg-[#f7f9f3] text-[#7c896f]" : "bg-[#f4f5f1] text-[#707b68]"}`}>{item.note}</p>}
                  </div>
                </div>
                <div className="border-t border-[#edf0e7] bg-[#fbfcf8] px-5 py-3 sm:px-6">
                  <details className="text-xs text-[#7a856e]"><summary className="cursor-pointer py-1 font-medium">공유받은 원문 보기</summary><blockquote className="my-3 border-l-2 border-[#ccd8bf] pl-3 leading-6 text-[#66735a]">{item.source_text}</blockquote></details>
                  <button type="button" onClick={() => void share(item)} className="mt-1 rounded-md py-2 text-xs font-semibold text-[#567048]" aria-label={`${item.title} 항목 공유`}>이 항목 공유 ↗</button>
                </div>
              </article>;
            })}
          </div>
        )}
      </section>
      <footer className="shell mt-10">
        <div className="flex flex-wrap items-start justify-between gap-5 border-t border-[#dce5d4] pt-7 text-xs leading-6 text-[#7d8973]">
          <p className="max-w-2xl">{clinicRecommendationMeta.notice}<br />지도 링크는 이름 검색 결과이며 병원의 공식 페이지나 현재 소속 확인을 뜻하지 않습니다.</p>
          <Link href="/prices" className="font-semibold text-[#4b6640] underline underline-offset-4">시술 가격 참고표도 보기 ↗</Link>
        </div>
      </footer>
    </main>
  );
}
