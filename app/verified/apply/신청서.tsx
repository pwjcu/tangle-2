"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "../../components/사이트헤더";
import { consentText, declarationItems, requiredDocuments } from "@/lib/검증신청";

type Result = { kind: "saved" } | { kind: "text"; text: string } | null;

export default function VerifiedApplyForm({ kakaoUrl }: { kakaoUrl: string | null }) {
  const [form, setForm] = useState({ clinic: "", doctor: "", specialty: "", address: "", contact_name: "", contact_phone: "", contact_email: "", website: "", disclosure: "" });
  const [surgery, setSurgery] = useState<boolean | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [copied, setCopied] = useState(false);

  const items = declarationItems.filter((item) => !item.surgeryOnly || surgery === true);
  const allChecked = surgery !== null && items.every((item) => checked[item.id]);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: event.target.value });

  const submit = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/verified-apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, performs_surgery: surgery, declarations: checked, consent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data.saved ? { kind: "saved" } : { kind: "text", text: data.text });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError((err as Error).message || "신청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally { setLoading(false); }
  };

  const field = "field w-full";
  const label = "grid gap-2 text-[14px] font-semibold text-[var(--color-carbon)]";

  if (result) {
    return (
      <main className="min-h-screen pb-28">
        <SiteHeader />
        <section className="shell max-w-2xl pt-12">
          <p className="eyebrow mb-5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />검증 신청</p>
          {result.kind === "saved" ? (
            <>
              <h1 className="type-section">신청을 받았어요.</h1>
              <p className="mt-4 text-[16px] leading-8 text-[var(--color-muted)]">영업일 기준 5일 안에 적어 주신 연락처로 서류 제출 방법을 안내드릴게요.</p>
            </>
          ) : (
            <>
              <h1 className="type-section">마지막 한 단계만 남았어요.</h1>
              <p className="mt-4 text-[16px] leading-8 text-[var(--color-muted)]">아래 신청 내용을 복사해 탱글 카카오톡 채널로 보내 주세요. 받는 즉시 서류 제출 방법을 안내드릴게요.</p>
              <pre className="mt-6 whitespace-pre-wrap rounded-[20px] bg-white p-5 text-[14px] leading-7 text-[var(--color-carbon)]">{result.text}</pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="action-primary" onClick={() => { void navigator.clipboard?.writeText(result.text).then(() => setCopied(true)); }}>{copied ? "복사했어요" : "신청 내용 복사"}</button>
                {kakaoUrl && <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="action-secondary">카카오톡 채널 열기 ↗</a>}
              </div>
            </>
          )}
          <h2 className="mt-10 text-[18px] font-bold">미리 준비해 주세요</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-6 text-[var(--color-muted)]">{requiredDocuments.map((doc) => <li key={doc}>{doc}</li>)}</ul>
          <Link href="/verified" className="action-secondary mt-8 inline-flex">검증 병원으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />
      <section className="shell max-w-3xl pb-8 pt-10 sm:pt-14">
        <p className="eyebrow mb-5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />원장님 검증 신청</p>
        <h1 className="type-section">당당하게 검증받으세요.</h1>
        <p className="mt-4 text-[16px] leading-8 text-[var(--color-muted)]">검증은 무료이고, 광고비로 살 수 없어요. 신청 후 서류를 받아 하나씩 확인하고, 모든 기준을 통과하면 검증 병원에 올려 드려요.</p>
      </section>

      <form className="shell grid max-w-3xl gap-8" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <fieldset className="grid gap-4 rounded-[24px] border border-[var(--color-silver-mist)] bg-white p-5 sm:grid-cols-2 sm:p-7">
          <legend className="px-1 text-[16px] font-bold">병원 정보</legend>
          <label className={label}>병원명<input required maxLength={80} value={form.clinic} onChange={set("clinic")} className={field} /></label>
          <label className={label}>대표원장 이름<input required maxLength={40} value={form.doctor} onChange={set("doctor")} className={field} /></label>
          <label className={label}>전문과목·전문의 여부<input required maxLength={60} placeholder="예: 성형외과 전문의" value={form.specialty} onChange={set("specialty")} className={field} /></label>
          <label className={label}>홈페이지 (선택)<input type="url" maxLength={300} placeholder="https://" value={form.website} onChange={set("website")} className={field} /></label>
          <label className={`${label} sm:col-span-2`}>병원 주소<input required maxLength={160} value={form.address} onChange={set("address")} className={field} /></label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-[24px] border border-[var(--color-silver-mist)] bg-white p-5 sm:grid-cols-3 sm:p-7">
          <legend className="px-1 text-[16px] font-bold">연락받을 분</legend>
          <label className={label}>이름<input required maxLength={40} value={form.contact_name} onChange={set("contact_name")} className={field} /></label>
          <label className={label}>연락처<input required inputMode="tel" maxLength={20} placeholder="010-0000-0000" value={form.contact_phone} onChange={set("contact_phone")} className={field} /></label>
          <label className={label}>이메일 (선택)<input type="email" maxLength={120} value={form.contact_email} onChange={set("contact_email")} className={field} /></label>
        </fieldset>

        <fieldset className="rounded-[24px] border border-[var(--color-silver-mist)] bg-white p-5 sm:p-7">
          <legend className="px-1 text-[16px] font-bold">원장님 자기신고</legend>
          <p className="text-[14px] text-[var(--color-muted)]">수술실이 있는 병원인가요?</p>
          <div className="mt-2 flex gap-2" role="radiogroup">
            {[{ v: true, t: "수술을 해요" }, { v: false, t: "수술은 안 해요" }].map((option) => (
              <button key={option.t} type="button" role="radio" aria-checked={surgery === option.v} onClick={() => setSurgery(option.v)}
                className={`rounded-full border px-4 py-2 text-[14px] font-semibold ${surgery === option.v ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--color-silver-mist)] text-[var(--color-muted)]"}`}>{option.t}</button>
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer gap-3 text-[14px] leading-6">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" checked={Boolean(checked[item.id])} onChange={(event) => setChecked({ ...checked, [item.id]: event.target.checked })} />
                  {item.text}
                </label>
              </li>
            ))}
          </ul>
          <label className={`${label} mt-5`}>진행 중인 의료분쟁이나 알려야 할 점 (선택)
            <textarea maxLength={1000} rows={3} value={form.disclosure} onChange={set("disclosure")} placeholder="없으면 비워 두세요. 숨긴 사실이 나중에 확인되면 검증이 취소돼요." className={field} />
          </label>
        </fieldset>

        <section className="rounded-[24px] bg-[var(--cream)] p-5 sm:p-7" aria-label="제출 서류 안내">
          <h2 className="text-[16px] font-bold">신청 후 받을 서류</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-6 text-[var(--color-muted)]">{requiredDocuments.map((doc) => <li key={doc}>{doc}</li>)}</ul>
          <p className="mt-3 text-[13px] text-[var(--color-muted)]">서류는 이 화면에서 올리지 않아요. 신청 후 안전한 방법으로 따로 받아요.</p>
        </section>

        <label className="flex cursor-pointer gap-3 text-[13px] leading-6 text-[var(--color-muted)]">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span><strong className="text-[var(--color-carbon)]">[필수] 개인정보 수집·이용 동의</strong> — {consentText}</span>
        </label>

        {error && <p role="alert" className="text-[14px] font-semibold text-[var(--accent)]">{error}</p>}
        <button type="submit" disabled={loading || !allChecked || !consent} className="action-primary w-full disabled:opacity-40 sm:w-auto">{loading ? "보내는 중…" : "검증 신청하기"}</button>
        {!allChecked && <p className="-mt-5 text-[13px] text-[var(--color-muted)]">수술 여부를 고르고 모든 항목에 체크하면 신청할 수 있어요.</p>}
      </form>
    </main>
  );
}
