import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/사이트헤더";
import LinkChip from "../components/링크칩";
import { needsReverification, verificationCriteria, verificationSteps, verifiedClinics } from "@/lib/검증병원";
import { partnerLinkLabels } from "@/lib/협업병원";

export const metadata: Metadata = {
  title: "검증 병원 — 자격·이력을 서류로 확인한 원장님",
  description: "의사면허·정상적인 의대 졸업·범죄 경력·의료사고·행정처분·수술실 CCTV까지 서류로 확인한 원장님만 올립니다. 광고비로 살 수 없는 자리예요.",
  alternates: { canonical: "/verified" },
};

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function VerifiedPage() {
  const clinics = verifiedClinics.filter((clinic) => !needsReverification(clinic));
  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />

      <section className="shell pb-10 pt-10 sm:pt-16" aria-labelledby="verified-title">
        <p className="eyebrow mb-5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />검증 병원</p>
        <h1 id="verified-title" className="type-title">자격과 이력을<br /><span className="text-[var(--brand)]">서류로 확인한 원장님.</span></h1>
        <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[var(--color-muted)]">
          후기나 광고가 아니라, 원장님이 직접 낸 서류로 확인해요. 아래 기준을 모두 통과한 병원만 올리고, 1년마다 다시 확인해요.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[#53665b]">
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">서류로 확인</span>
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">광고비로 못 사요</span>
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">1년마다 재확인</span>
        </div>
      </section>

      <section className="shell" aria-labelledby="criteria-title">
        <h2 id="criteria-title" className="type-section">검증 기준 {verificationCriteria.length}가지</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {verificationCriteria.map((criterion, index) => (
            <li key={criterion.id} className="rounded-[22px] border border-[var(--color-silver-mist)] bg-white p-5">
              <p className="flex items-center gap-2 text-[12px] font-bold text-[var(--accent)]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><CheckIcon /></span>{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-[17px] font-bold text-[var(--color-carbon)]">{criterion.title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-[var(--color-muted)]">{criterion.detail}</p>
              <p className="mt-3 border-t border-[var(--color-silver-mist)] pt-3 text-[12px] text-[#5f6d63]">확인 방법 · {criterion.proof}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell mt-14" aria-labelledby="list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="list-title" className="type-section">검증을 통과한 병원</h2>
          <p className="text-[14px] text-[var(--color-muted)]">{clinics.length}곳</p>
        </div>
        {clinics.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#cfdcc9] bg-white/70 px-6 py-14 text-center">
            <p className="text-[20px] font-bold text-[var(--color-carbon)]">첫 검증 병원을 심사하고 있어요</p>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[var(--color-muted)]">기준을 모두 통과한 곳만 올리기 때문에 시간이 조금 걸려요. 그동안 운영진 경험으로 고른 추천 병원을 둘러보세요.</p>
            <Link href="/clinics" className="action-secondary mt-6 inline-flex">추천 병원 보기</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clinics.map((clinic) => (
              <article key={clinic.id} className="rounded-[22px] border border-[var(--color-silver-mist)] bg-white p-6">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3 py-1 text-[11px] font-bold text-white"><CheckIcon />탱글 검증 {clinic.verifiedAt.slice(0, 7).replace("-", ".")}</p>
                <h3 className="mt-4 text-[20px] font-bold text-[var(--color-carbon)]">{clinic.clinic}</h3>
                <p className="mt-1 text-[14px] text-[#5f6d63]">{clinic.doctor} 원장 · {clinic.specialty} · {clinic.region}</p>
                <p className="mt-3 text-[14px] leading-6 text-[var(--color-muted)]">{clinic.intro}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {verificationCriteria.filter((criterion) => criterion.id !== "noad").map((criterion) => (
                    <li key={criterion.id} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${clinic.checks[criterion.id] === "pass" ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "bg-[#f1f1ee] text-[#7c8279]"}`}>
                      {clinic.checks[criterion.id] === "pass" ? "✓ " : ""}{criterion.title}{clinic.checks[criterion.id] === "na" ? " · 해당 없음" : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] text-[#829078]">주소: {clinic.address}</p>
                {clinic.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {clinic.links.map((link) => <LinkChip key={link.url} href={link.url} label={partnerLinkLabels[link.kind].ko} />)}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="shell mt-14" aria-labelledby="steps-title">
        <div className="rounded-[28px] bg-[var(--brand)] p-6 text-white sm:p-10">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-[#f3b3a6]">FOR DOCTORS</p>
          <h2 id="steps-title" className="mt-3 text-[1.8rem] font-bold leading-tight sm:text-[2.2rem]">당당하게 검증받을 원장님을 찾아요</h2>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {verificationSteps.map((step, index) => (
              <li key={step.title} className="rounded-[20px] bg-white/10 p-5">
                <p className="text-[12px] font-bold text-[#f3b3a6]">STEP {index + 1}</p>
                <p className="mt-2 text-[18px] font-bold">{step.title}</p>
                <p className="mt-2 text-[14px] leading-6 text-white/80">{step.detail}</p>
              </li>
            ))}
          </ol>
          <Link href="/verified/apply" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[var(--brand)] hover:opacity-90">원장님 검증 신청 →</Link>
        </div>
        <p className="mt-6 text-[12px] leading-6 text-[#7d8973]">검증은 원장님이 낸 서류와 공개 자료를 기준으로 해요. 진료 결과나 효과를 보장하지 않으며, 허위가 확인되면 바로 내립니다.</p>
      </section>
    </main>
  );
}
