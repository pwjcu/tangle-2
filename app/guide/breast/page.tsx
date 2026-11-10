import type { Metadata } from "next";
import Link from "next/link";
import {
  breastAdvice,
  breastChecklist,
  breastComparisons,
  breastDiscontinued,
  breastGuideMeta,
  breastGuidePriority,
  breastGuideSources,
  breastGuideSummary,
  breastImplantNote,
  breastImplants,
} from "@/lib/가슴성형가이드";
import { clinicRecommendations } from "@/lib/서울경험추천";

export const metadata: Metadata = {
  title: "가슴성형 상담 가이드 — 보형물 5종 비교와 상담 체크리스트",
  description: "서울 성형외과 10곳 상담과 의료진 의견으로 정리한 가슴성형 가이드. 멘토 엑스트라·부스트, 바운스, 모티바 비교, 근막하 vs 이중평면, 상담에서 꼭 물어볼 것.",
  alternates: { canonical: "/guide/breast" },
};

const dataTone: Record<string, string> = {
  "많음": "border-[#d3e6df] bg-[#eef7f1] text-[#285c48]",
  "중간": "border-[#eadbb9] bg-[#fff8e7] text-[#7e5b1f]",
  "적음": "border-[#ead0cb] bg-[#fcf1ef] text-[#8a4a3d]",
};

export default function BreastGuidePage() {
  const consulted = clinicRecommendations.find((item) => item.id === "breast");
  const priced = breastImplants.filter((item) => item.price);

  return (
    <main className="min-h-screen pb-20">
      <header className="border-b border-[#dce8e2] bg-white/90">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
          <Link href="/" className="text-2xl font-semibold tracking-[-0.06em] text-[#244e3e]" aria-label="탱글 홈">tangle<span className="text-[#8caa80]">.</span></Link>
          <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/clinics" className="ghost-link">서울 경험 추천</Link>
            <Link href="/guide/breast" aria-current="page" className="rounded-full bg-[#edf4ec] px-4 py-2 font-semibold text-[#294f3e]">가슴성형 가이드</Link>
            <Link href="/prices" className="ghost-link">가격 참고표</Link>
          </nav>
        </div>
      </header>

      <section className="shell pb-10 pt-10 sm:pt-16" aria-labelledby="guide-title">
        <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#4a705d]"><span className="h-2 w-2 rounded-full bg-[#6b9277]" /> TANGLE GUIDE · BREAST</p>
        <h1 id="guide-title" className="text-[2.2rem] font-semibold !leading-[1.18] text-[#243f33] sm:text-[3.4rem]">상담 10곳을 다녀와서<br /><span className="text-[#75947a]">정리한 가슴성형 가이드.</span></h1>
        <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[#4f5f55] sm:text-[17px]"><strong className="text-[#243f33]">{breastGuideSummary}</strong></p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[#53665b]">
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">서울 성형외과 10곳 직접 상담</span>
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">치과·간호·성형외과·일반의 의견</span>
          <span className="rounded-full border border-[#d4e1d5] bg-white px-3 py-2">병원·제조사 협찬 없음</span>
        </div>
      </section>

      <div className="shell space-y-14">
        <section aria-labelledby="priority-heading">
          <h2 id="priority-heading" className="text-2xl font-semibold !leading-snug text-[#2f4a3a]">결과를 좌우하는 순서</h2>
          <p className="mt-2 text-sm text-[#6b7867]">프리미엄급 보형물을 쓴다는 전제에서, 만나 본 의료진 모두가 같은 순서를 말했습니다.</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {breastGuidePriority.map((item, index) => (
              <li key={item.title} className="rounded-[24px] border border-[#dde6da] bg-white p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#315640] text-sm font-semibold text-white">{index + 1}</span>
                <h3 className="mt-4 text-lg font-semibold text-[#31492e]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f6c58]">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="implant-heading">
          <h2 id="implant-heading" className="text-2xl font-semibold !leading-snug text-[#2f4a3a]">보형물 한눈에 비교</h2>
          <p className="mt-2 text-sm text-[#6b7867]">{breastGuideMeta.price_note}</p>
          <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#dde6da] bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f4f8f1] text-xs text-[#5a6d55]">
                <tr><th scope="col" className="px-4 py-3 font-semibold">보형물</th><th scope="col" className="px-4 py-3 font-semibold">상담 가격대</th><th scope="col" className="px-4 py-3 font-semibold">촉감</th><th scope="col" className="px-4 py-3 font-semibold">잘 맞는 체형</th><th scope="col" className="px-4 py-3 font-semibold">장기 데이터</th></tr>
              </thead>
              <tbody>
                {priced.map((item) => (
                  <tr key={item.id} className="border-t border-[#eef1e9] align-top">
                    <th scope="row" className="px-4 py-3 font-semibold text-[#31492e]"><a href={`#${item.id}`} className="underline decoration-[#c4d3b9] underline-offset-4">{item.name}</a><span className="mt-1 block text-[11px] font-normal text-[#839079]">{item.maker}</span></th>
                    <td className="whitespace-nowrap px-4 py-3 text-[#3f5138]">{item.price}</td>
                    <td className="px-4 py-3 text-[#5f6c58]">{item.feel}</td>
                    <td className="px-4 py-3 text-[#5f6c58]">{item.fit}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${dataTone[item.long_term_data]}`}>{item.long_term_data}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
            {breastImplants.map((item) => (
              <article key={item.id} id={item.id} className="scroll-mt-6 rounded-[24px] border border-[#dde6da] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold text-[#31492e]">{item.name}</h3>
                  <span className="text-sm font-semibold text-[#4b6640]">{item.price ?? "요즘 잘 쓰지 않음"}</span>
                </div>
                <p className="mt-1 text-xs text-[#839079]">{item.maker}</p>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <div><dt className="text-xs font-semibold text-[#5b7a52]">장점</dt><dd className="text-[#4c5b46]">{item.strengths}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#8a6a2a]">주의할 점</dt><dd className="text-[#4c5b46]">{item.cautions}</dd></div>
                  <div><dt className="text-xs font-semibold text-[#5b7a52]">잘 맞는 체형</dt><dd className="text-[#4c5b46]">{item.fit}</dd></div>
                </dl>
                {item.facts && <ul className="mt-4 space-y-2 border-t border-[#eef1e9] pt-4 text-xs leading-5 text-[#6a7762]">
                  {item.facts.map((fact) => <li key={fact.text}>확인한 사실: {fact.text} · <a href={fact.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{fact.source} ↗</a></li>)}
                </ul>}
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-[#f4f7ef] px-4 py-4 text-sm leading-6 text-[#56654e]">{breastImplantNote}</p>
          <p className="mt-3 rounded-2xl border border-[#eadbb9] bg-[#fff8e7] px-4 py-4 text-sm leading-6 text-[#6e5420]"><strong>{breastDiscontinued.name}:</strong> {breastDiscontinued.detail} <a href={breastDiscontinued.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{breastDiscontinued.source} ↗</a></p>
        </section>

        <section aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="text-2xl font-semibold !leading-snug text-[#2f4a3a]">상담에서 꼭 나오는 비교</h2>
          <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
            {breastComparisons.map((comparison) => (
              <article key={comparison.id} className="rounded-[24px] border border-[#dde6da] bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[#31492e]">{comparison.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f6c58]">{comparison.lead}</p>
                <table className="mt-4 w-full text-left text-sm">
                  <thead className="text-xs text-[#6b7d63]"><tr><th scope="col" className="py-2 pr-3 font-semibold">구분</th><th scope="col" className="py-2 pr-3 font-semibold">{comparison.a}</th><th scope="col" className="py-2 font-semibold">{comparison.b}</th></tr></thead>
                  <tbody>{comparison.rows.map(([label, a, b]) => <tr key={label} className="border-t border-[#eef1e9] align-top"><th scope="row" className="py-2 pr-3 font-medium text-[#3f5138]">{label}</th><td className="py-2 pr-3 text-[#5f6c58]">{a}</td><td className="py-2 text-[#5f6c58]">{b}</td></tr>)}</tbody>
                </table>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="advice-heading">
          <h2 id="advice-heading" className="text-2xl font-semibold !leading-snug text-[#2f4a3a]">의료진에게 들은 현실 조언</h2>
          <p className="mt-2 text-sm text-[#6b7867]">가장 많이 들은 말은 “크기 욕심을 내려놓으라”였습니다.</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {breastAdvice.map((tip) => <li key={tip.title} className="rounded-[20px] border border-[#e3e9df] bg-white p-5"><p className="font-semibold text-[#31492e]">{tip.title}</p>{tip.detail && <p className="mt-2 text-sm leading-6 text-[#5f6c58]">{tip.detail}</p>}</li>)}
          </ul>
        </section>

        <section aria-labelledby="checklist-heading" className="rounded-[28px] bg-[#243f33] p-6 text-white sm:p-8">
          <h2 id="checklist-heading" className="text-2xl font-semibold !leading-snug">상담실에서 꼭 물어볼 것</h2>
          <p className="mt-2 text-sm text-white/70">캡처해 두고 상담 때 하나씩 확인해 보세요.</p>
          <ol className="mt-6 space-y-4">
            {breastChecklist.map((item, index) => <li key={item.title} className="flex gap-4"><span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">{index + 1}</span><div><p className="font-semibold">{item.title}</p>{item.detail && <p className="mt-1 text-sm leading-6 text-white/75">{item.detail}</p>}</div></li>)}
          </ol>
        </section>

        {consulted && <section aria-labelledby="consulted-heading">
          <h2 id="consulted-heading" className="text-2xl font-semibold !leading-snug text-[#2f4a3a]">상담 다녀온 병원 10곳</h2>
          <p className="mt-2 text-sm text-[#6b7867]">방문 순서이며 순위가 아닙니다. 수술 후기가 아닌 상담 경험입니다.</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {consulted.providers.map((provider) => <li key={provider.clinic} className="rounded-2xl border border-[#e3e9df] bg-white px-4 py-3"><p className="text-sm font-semibold text-[#3f5138]">{provider.clinic}</p><p className="mt-1 text-xs text-[#6b7867]">{provider.doctors.length ? `${provider.doctors.join(" · ")} 원장` : provider.note}</p></li>)}
          </ul>
          <Link href="/clinics?item=breast" className="mt-4 inline-block text-sm font-semibold text-[#4b6640] underline underline-offset-4">서울 경험 추천에서 보기 ↗</Link>
        </section>}

        <section aria-labelledby="sources-heading" className="border-t border-[#dce5d4] pt-8 text-xs leading-6 text-[#6f7b68]">
          <h2 id="sources-heading" className="text-sm font-semibold text-[#3f5138]">참고 자료</h2>
          <ul className="mt-2 space-y-1">{breastGuideSources.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{item.title}</a></li>)}</ul>
          <p className="mt-4 max-w-3xl">{breastGuideMeta.notice}</p>
        </section>
      </div>
    </main>
  );
}
