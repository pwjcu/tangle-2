import {
  formatPublicPriceRange,
  formatWon,
  priceKindLabels,
  publicPriceDate,
  taxLabels,
  type PublicPriceGroup,
} from "@/lib/공개시술가격";

const dateLabel = (date: string) => date.replaceAll("-", ".");

export function PublicPriceMethod() {
  return (
    <aside id="price-method" className="scroll-mt-24 rounded-2xl border border-[var(--color-silver-mist)] bg-[var(--color-porcelain-gray)] p-5 sm:p-6">
      <h2 className="text-base font-bold">가격 자료와 집계 기준</h2>
      <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-muted)]">
        <p>시술 가격 지수에는 병원의 공개 가격표·이벤트 화면과 규격·금액·시기를 확인할 수 있는 실제 방문자의 상담 후기를 참고합니다. 의료광고나 특정 병원에 대한 추천이 아닙니다.</p>
        <p>{dateLabel(publicPriceDate)}에 확인한 이번 갱신분은 서울 병원의 공식 공개 자료를 바탕으로 집계했습니다.</p>
        <p>제품·부위·샷 수·용량·회차가 같은 표본을 비교합니다. 일반가와 공개 이벤트가는 각각 세금을 반영하고, 같은 조건의 병원이 3곳 이상일 때 평균과 중위가를 표시합니다. 1회 체험가, 추가 조건이 붙은 가격, 세금 표기가 없는 가격은 개별 원문에서 확인할 수 있어요.</p>
      </div>
    </aside>
  );
}

export default function PublicPriceEvidence({ groups }: { groups: PublicPriceGroup[] }) {
  const variants = [...new Set(groups.map((group) => group.variant))];
  return (
    <section aria-labelledby="current-prices-title" className="grid gap-5">
      <div>
        <h2 id="current-prices-title" className="type-section !text-2xl">규격별 공개 가격</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{dateLabel(publicPriceDate)} 확인 · 서울 소재 병원 · <a href="#price-method" className="underline underline-offset-4">가격 집계 기준</a></p>
      </div>
      {variants.map((variant) => (
        <div key={variant} className="rounded-2xl border border-[var(--color-silver-mist)] bg-white">
          <h3 className="border-b border-[var(--color-silver-mist)] px-4 py-3 text-base font-bold !leading-snug text-[var(--brand)] sm:px-5">{variant}</h3>
          {groups.filter((group) => group.variant === variant).map((group) => {
            const showRange = group.samples.length === 1
              || (group.taxKnown && (group.kind === "regular" || group.kind === "event") && !group.variant.includes("미표기"));
            return (
            <div key={`${group.kind}-${group.taxKnown}`} className="border-b border-[var(--color-silver-mist)] px-4 py-4 last:border-b-0 sm:px-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold">{priceKindLabels[group.kind]}</span>
                {group.averageWon !== null ? <strong className="text-lg">평균 {formatWon(group.averageWon)}</strong>
                  : showRange && <strong className="text-lg">{formatPublicPriceRange(group)}</strong>}
                <span className="text-xs text-[var(--color-muted)]">{group.taxKnown ? "세금 반영" : "VAT 표기 없음"} · {group.samples.length}곳</span>
              </div>
              {group.medianWon !== null && <p className="mt-1 text-sm text-[var(--color-muted)]">중위 {formatWon(group.medianWon)} · 범위 {formatPublicPriceRange(group)}</p>}
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer font-semibold text-[var(--brand)]">병원별 가격과 원문</summary>
                <ul className="mt-3 divide-y divide-[var(--color-silver-mist)] rounded-xl bg-[var(--cream)] px-4">
                  {group.samples.map((sample) => (
                    <li key={sample.clinic} className="py-3">
                      <div className="flex flex-wrap justify-between gap-1">
                        <a href={sample.url} target="_blank" rel="noopener noreferrer" aria-label={`${sample.clinic} 가격 원문, 새 창`} className="font-semibold text-[var(--brand)] underline underline-offset-4">{sample.clinic} ↗</a>
                        <strong>{formatWon(sample.totalWon ?? sample.postedWon)}</strong>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                        {sample.district} · 원문 {formatWon(sample.postedWon)} · {taxLabels[sample.tax]}
                        {sample.endsOn ? ` · ${dateLabel(sample.endsOn)}까지` : sample.kind !== "regular" ? " · 종료일 원문 확인" : ""}
                        {sample.terms ? ` · ${sample.terms}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
