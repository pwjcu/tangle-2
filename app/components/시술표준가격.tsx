import Link from "next/link";
import type { StandardTreatmentPrice } from "../../lib/시술표준가격";

const priceFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

function formatPrice(value: number) {
  return `${priceFormatter.format(value)}만원`;
}

function formatComposition(price: StandardTreatmentPrice) {
  const labels: Record<StandardTreatmentPrice["kind"], string> = {
    single: "단일 시술",
    package: "패키지",
    combination: "복합 구성",
    unlimited: "무제한",
  };

  return price.session_count === null
    ? labels[price.kind]
    : `${labels[price.kind]} · ${price.session_count}회`;
}

export default function StandardPriceTable({
  prices,
  showTreatment = false,
}: {
  prices: StandardTreatmentPrice[];
  showTreatment?: boolean;
}) {
  if (prices.length === 0) return null;

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-[var(--color-silver-mist)] bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-carbon)]"
      role="region"
      aria-label="규격별 시술 표준가격표, 가로로 스크롤할 수 있습니다"
      tabIndex={0}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <caption className="sr-only">규격별 시술 표준가격표. 금액 단위는 만원입니다.</caption>
        <thead className="border-b border-[var(--color-silver-mist)] bg-[var(--color-porcelain-gray)] text-[12px] text-[var(--color-muted)]">
          <tr>
            {showTreatment && <th scope="col" className="px-5 py-4 font-medium">시술</th>}
            <th scope="col" className="px-5 py-4 font-medium">규격</th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">가격 범위</th>
            <th scope="col" className="whitespace-nowrap px-5 py-4 font-medium">제공 평균</th>
            <th scope="col" className="px-5 py-4 font-medium">구성</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => (
            <tr key={price.id} className="border-b border-[var(--color-line)] align-top last:border-b-0">
              {showTreatment && (
                <th scope="row" className="px-5 py-5 font-medium">
                  <Link href={`/prices/${encodeURIComponent(price.treatment_name)}`} className="underline decoration-[var(--color-silver-mist)] underline-offset-4 hover:decoration-[var(--color-carbon)]">{price.treatment_name}</Link>
                </th>
              )}
              <td className="min-w-[180px] px-5 py-5">
                <span className="font-medium">{price.variant}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-5 tabular-nums">
                {price.min_price_manwon === price.max_price_manwon
                  ? formatPrice(price.min_price_manwon)
                  : `${formatPrice(price.min_price_manwon)} – ${formatPrice(price.max_price_manwon)}`}
              </td>
              <td className="whitespace-nowrap px-5 py-5 tabular-nums">
                {price.average_price_manwon === null ? <span className="text-[var(--color-muted)]">미제공</span> : formatPrice(price.average_price_manwon)}
              </td>
              <td className="min-w-[140px] px-5 py-5 text-[var(--color-muted)]">{formatComposition(price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StandardPriceNotice() {
  return (
    <aside className="rounded-2xl border border-[var(--color-silver-mist)] bg-[var(--color-porcelain-gray)] p-5 text-[12px] leading-6 text-[var(--color-muted)]">
      <p>사용자 제공 요약자료 · 2026.10.21 반영. 원본 및 평균 산출 근거 대조는 미완료입니다.</p>
      <p className="mt-1">단위: 만원 · 부가세 10% 별도 기준이며, 일부 출처의 원문 부가세 표기는 미확인입니다. ‘제공 평균’은 자료에 기재된 값으로, 검증된 시장 평균을 뜻하지 않습니다.</p>
      <p className="mt-1">규격·횟수·복합 구성이 다른 가격은 직접 비교하기 어렵습니다. 실제 적용 조건과 최종 비용은 병원에서 확인하세요.</p>
    </aside>
  );
}
