"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../components/LanguageProvider";
import { globalGuideCopy as copy, globalGuideSections, staffPhrases, tipsFor, type VisitPlan, type VisitStay } from "@/lib/글로벌가이드";
import { partnerClinics, partnerLinkLabels } from "@/lib/협업병원";

const STORAGE_KEY = "tangle:global-guide:v1";
type Saved = { plan: VisitPlan; stay: VisitStay; checked: string[]; phrases: string[] };

function load(): Saved | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return value && typeof value === "object" ? value : null;
  } catch { return null; }
}

export default function GlobalGuide() {
  const { language } = useLanguage();
  const [plan, setPlan] = useState<VisitPlan>("skin");
  const [stay, setStay] = useState<VisitStay>("short");
  const [checked, setChecked] = useState<string[]>([]);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [showCard, setShowCard] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = load();
    // 저장된 선택을 첫 렌더 뒤에 불러와 서버 렌더와 어긋나지 않게 합니다.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) {
      if (saved.plan === "skin" || saved.plan === "surgery") setPlan(saved.plan);
      if (saved.stay === "short" || saved.stay === "long") setStay(saved.stay);
      if (Array.isArray(saved.checked)) setChecked(saved.checked.filter((v) => typeof v === "string"));
      if (Array.isArray(saved.phrases)) setPhrases(saved.phrases.filter((v) => typeof v === "string"));
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, stay, checked, phrases })); } catch { /* 저장이 막혀도 화면은 동작합니다. */ }
  }, [loaded, plan, stay, checked, phrases]);

  useEffect(() => {
    if (!showCard) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setShowCard(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCard]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  const visiblePhrases = staffPhrases.filter((phrase) => !phrase.plans || phrase.plans.includes(plan));
  const selectedPhrases = visiblePhrases.filter((phrase) => phrases.includes(phrase.id));
  const L = (text: Record<string, string>) => text[language] ?? text.en;

  return (
    <main className="min-h-screen pb-28">
      <header className="border-b border-[#dce8e2] bg-white/90">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.06em] text-[#244e3e]" aria-label="Tangle home">tangle<span className="text-[#8caa80]">.</span></Link>
          <LanguageSwitcher />
        </div>
      </header>

      <section className="shell pb-8 pt-10 sm:pt-14" aria-labelledby="global-title">
        <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-[#4a705d]">{L(copy.eyebrow)}</p>
        <h1 id="global-title" className="whitespace-pre-line text-[2.2rem] font-semibold !leading-[1.18] text-[#243f33] sm:text-[3.4rem]">{L(copy.title)}</h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#4f5f55] sm:text-[16px]">{L(copy.intro)}</p>
      </section>

      <div className="shell space-y-10">
        <section className="grid gap-4 rounded-[28px] border border-[#dce8df] bg-white p-5 sm:grid-cols-2 sm:p-7" aria-label={L(copy.planQuestion)}>
          <fieldset>
            <legend className="text-sm font-semibold text-[#304a3a]">{L(copy.planQuestion)}</legend>
            <div className="mt-3 grid gap-2">
              {(["skin", "surgery"] as const).map((value) => <button key={value} type="button" aria-pressed={plan === value} onClick={() => setPlan(value)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium ${plan === value ? "border-[#315640] bg-[#315640] text-white" : "border-[#e0e6db] text-[#4c604d] hover:bg-[#f3f6ee]"}`}>{L(copy.plans[value])}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold text-[#304a3a]">{L(copy.stayQuestion)}</legend>
            <div className="mt-3 grid gap-2">
              {(["short", "long"] as const).map((value) => <button key={value} type="button" aria-pressed={stay === value} onClick={() => setStay(value)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium ${stay === value ? "border-[#315640] bg-[#315640] text-white" : "border-[#e0e6db] text-[#4c604d] hover:bg-[#f3f6ee]"}`}>{L(copy.stays[value])}</button>)}
            </div>
          </fieldset>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {globalGuideSections.map((section) => (
            <section key={section.id} aria-labelledby={`section-${section.id}`} className="rounded-[24px] border border-[#dde6da] bg-white p-5 sm:p-6">
              <h2 id={`section-${section.id}`} className="text-lg font-semibold text-[#2f4a3a]">{L(section.title)}</h2>
              <ul className="mt-4 space-y-2">
                {tipsFor(section, plan, stay).map((tip) => {
                  const id = `${section.id}:${tip.text.ko}`;
                  const isChecked = checked.includes(id);
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer gap-3 rounded-xl px-2 py-2 text-[14px] leading-6 text-[#3f5138] hover:bg-[#f6f9f3]">
                        <input type="checkbox" checked={isChecked} onChange={() => setChecked(toggle(checked, id))} className="mt-1 h-4 w-4 shrink-0 accent-[#315640]" />
                        <span className={isChecked ? "text-[#9aa595] line-through" : ""}>{L(tip.text)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <p className="-mt-6 text-xs text-[#7c8778]">{L(copy.checklistHint)}</p>

        <section aria-labelledby="staff-title" className="rounded-[28px] border border-[#d3e6df] bg-[#eef7f1] p-5 sm:p-7">
          <h2 id="staff-title" className="text-xl font-semibold text-[#243f33]">{L(copy.staffTitle)}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4f5f55]">{L(copy.staffIntro)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {visiblePhrases.map((phrase) => {
              const active = phrases.includes(phrase.id);
              return <button key={phrase.id} type="button" aria-pressed={active} onClick={() => setPhrases(toggle(phrases, phrase.id))} className={`rounded-full border px-4 py-2 text-left text-sm ${active ? "border-[#315640] bg-[#315640] text-white" : "border-[#cfe0d6] bg-white text-[#3f5138] hover:bg-[#f6faf7]"}`}>{L(phrase.text)}</button>;
            })}
          </div>
          <button type="button" onClick={() => setShowCard(true)} disabled={!selectedPhrases.length} className="mt-5 w-full rounded-2xl bg-[#243f33] px-6 py-4 text-base font-semibold text-white disabled:opacity-40 sm:w-auto">{L(copy.staffShow)} ({selectedPhrases.length})</button>
          {!selectedPhrases.length && <p className="mt-2 text-xs text-[#6b7867]">{L(copy.staffEmpty)}</p>}
        </section>

        <section aria-labelledby="partners-title">
          <h2 id="partners-title" className="text-2xl font-semibold text-[#2f4a3a]">{L(copy.partnersTitle)}</h2>
          <p className="mt-2 text-sm text-[#6b7867]">{L(copy.partnersNote)}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {partnerClinics.map((clinic) => (
              <article key={clinic.id} className="flex flex-col rounded-[24px] border border-[#dde6da] bg-white p-5 sm:p-6">
                <span className="w-fit rounded-full bg-[#1f3d33] px-2.5 py-1 text-[10px] font-semibold text-white">{L(copy.partnerBadge)}</span>
                <h3 className="mt-3 text-lg font-semibold text-[#31492e]">{L(clinic.name)}</h3>
                {language !== "ko" && <p className="text-xs text-[#8a9786]">{clinic.name.ko}</p>}
                <p className="mt-2 text-sm text-[#65725c]">{L(clinic.area)}</p>
                {clinic.doctor && <p className="mt-1 text-sm text-[#65725c]">{L(clinic.doctor)}</p>}
                <p className="mt-3 flex-1 text-[14px] leading-6 text-[#3f5138]">{L(clinic.highlights)}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {clinic.links.map((link) => <a key={link.url} href={link.url} target={link.kind === "phone" ? undefined : "_blank"} rel="noopener noreferrer" className={`rounded-full px-3 py-1.5 text-xs font-semibold ${link.kind === "whatsapp" || link.kind === "booking" ? "bg-[#315640] text-white hover:bg-[#244530]" : "border border-[#cfe0d6] text-[#2f5544] hover:bg-[#eef6f1]"}`}>{L(partnerLinkLabels[link.kind])}{link.note ? ` (${L(link.note)})` : ""} ↗</a>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="help-title" className="rounded-[24px] border border-[#eadbb9] bg-[#fff8e7] p-5 sm:p-6">
          <h2 id="help-title" className="text-lg font-semibold text-[#5c4415]">{L(copy.helpTitle)}</h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-6 text-[#5c4a26]">{copy.help.map((item) => <li key={item.ko}>· {L(item)}</li>)}</ul>
          <p className="mt-4 text-xs leading-5 text-[#7e6a40]">{L(copy.disclaimer)}</p>
        </section>
      </div>

      {showCard && (
        <div role="dialog" aria-modal="true" aria-label={L(copy.staffTitle)} className="fixed inset-0 z-50 overflow-y-auto bg-white p-5 sm:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#4a705d]">외국인 환자입니다 · {L(copy.staffTitle)}</p>
              <button type="button" onClick={() => setShowCard(false)} autoFocus className="rounded-full border border-[#cfe0d6] px-5 py-2 text-sm font-semibold">{L(copy.staffClose)}</button>
            </div>
            <ol className="mt-6 space-y-5">
              {selectedPhrases.map((phrase) => (
                <li key={phrase.id} className="rounded-3xl border border-[#dce8df] p-5 sm:p-7">
                  <p lang="ko" className="text-[1.6rem] font-semibold leading-snug text-[#1f2f27] sm:text-[2.2rem]">{phrase.text.ko}</p>
                  {language !== "ko" && <p className="mt-3 text-base text-[#6b7867]">{L(phrase.text)}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </main>
  );
}
