import type { Metadata } from "next";
import Link from "next/link";
import PriceIndexNote from "../components/PriceIndexNote";
import StandardPriceTable, { StandardPriceNotice } from "../components/시술표준가격";
import PublicPriceList from "../components/공개시술가격목록";
import { PublicPriceMethod } from "../components/공개시술가격근거";
import { getPublicPriceSummaries, publicPriceDate, publicPriceSnapshot } from "@/lib/공개시술가격";
import { standardTreatmentPrices } from "@/lib/시술표준가격";
import SiteHeader from "../components/사이트헤더";
import {
  categoryLabel,
  formatDateKo,
  formatManwon,
  getPriceIndexEntries,
  gradeLabel,
  type PriceIndexEntry,
} from "@/lib/priceIndex";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "서울 시술 가격표 — 규격별 공개 가격 비교",
  description:
    "서울 병원이 공개한 시술 가격을 샷 수·용량·회차별로 비교하세요. 일반가, 이벤트가, 평균, 세금과 병원 원문을 확인할 수 있어요.",
  alternates: { canonical: "/prices" },
  openGraph: {
    title: "탱글 | 서울 시술 가격표",
    description:
      "서울 병원 공개 가격을 조건별로 비교하고 원문까지 확인하세요.",
    type: "website",
  },
};

const CATEGORY_ORDER = ["리프팅", "스킨부스터", "필러", "보톡스", "색소", "색소/레이저", "모공흉터", "관리", "바디라인", "제모"];

function groupByCategory(entries: PriceIndexEntry[]): [string, PriceIndexEntry[]][] {
  const groups = new Map<string, PriceIndexEntry[]>();
  for (const entry of entries) {
    const key = entry.category ?? "기타";
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return [...groups.entries()].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a[0]);
    const ib = CATEGORY_ORDER.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function gradeBadge(grade: PriceIndexEntry["confidence_grade"]) {
  const color =
    grade === "high" ? "var(--color-carbon)" : grade === "medium" ? "var(--color-muted)" : "#b45309";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color,
        border: "1px solid var(--color-line)",
        borderRadius: "999px",
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {gradeLabel(grade)}
    </span>
  );
}

export default async function PricesPage() {
  const entries = await getPriceIndexEntries();
  const groups = groupByCategory(entries);
  const standardCategories = [...new Set(standardTreatmentPrices.map((price) => price.category))].sort(
    (a, b) => {
      const index = (category: string) => {
        const found = CATEGORY_ORDER.indexOf(category);
        return found === -1 ? CATEGORY_ORDER.length : found;
      };
      return index(a) - index(b);
    },
  );

  return (
    <main>
      <SiteHeader />

      <div className="shell" style={{ padding: "48px 24px 72px", display: "grid", gap: "36px" }}>
        <section>
          <span className="eyebrow">Tangle · 시술 가격표</span>
          <h1 className="type-title" style={{ fontSize: "42px", margin: "14px 0 16px" }}>
            시술 가격, 규격별로 확인하세요
          </h1>
          <p className="type-copy" style={{ maxWidth: "640px" }}>
            상담 전에 같은 제품·샷 수·용량·회차끼리 비교해 보세요. 일반가와 이벤트가부터 세금과 적용 조건까지 확인할 수 있어요.
          </p>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            <time dateTime={publicPriceDate}>{publicPriceDate.replaceAll("-", ".")}</time> 확인 · 서울 병원 {publicPriceSnapshot.clinicCount}곳 · 가격 {publicPriceSnapshot.observationCount}건
          </p>
          <a href="#price-method" className="mt-2 inline-block text-sm font-medium text-[var(--brand)] underline underline-offset-4">가격 집계 기준</a>
        </section>

        <PublicPriceList items={getPublicPriceSummaries()} />
        <PublicPriceMethod />
        <details id="price-archive" className="scroll-mt-24 rounded-2xl border border-[var(--color-silver-mist)] bg-white p-4 sm:p-6">
          <summary className="cursor-pointer font-semibold text-[var(--brand)]">이전 가격 자료 보기</summary>
          <div className="mt-6 grid min-w-0 gap-8">
        <section aria-labelledby="standard-prices-title" style={{ display: "grid", gap: "20px" }}>
          <div>
            <h2 id="standard-prices-title" className="type-section" style={{ margin: "0 0 12px" }}>
              2026년 표준규격 참고 가격
            </h2>
            <StandardPriceNotice />
          </div>
          {standardCategories.map((category) => (
            <section key={category} style={{ display: "grid", gap: "12px", minWidth: 0 }}>
              <h3 className="type-section" style={{ margin: 0, fontSize: "20px" }}>
                {categoryLabel(category)}
              </h3>
              <StandardPriceTable
                prices={standardTreatmentPrices.filter((price) => price.category === category)}
                showTreatment
              />
            </section>
          ))}
        </section>

        <section aria-labelledby="observed-prices-title">
          <h2 id="observed-prices-title" className="type-section" style={{ margin: "0 0 12px" }}>
            강남권 공개 가격 근거 집계
          </h2>
          <p className="type-copy" style={{ margin: 0 }}>
            아래 {entries.length}개 시술의 중위가와 근거 수는 기존 수집분의 집계입니다.
            위 표준규격 요약자료는 이 통계의 표본 수나 중위값에 포함하지 않았습니다.
          </p>
        </section>

        {entries.length === 0 ? (
          <section
            style={{
              border: "1px dashed var(--color-line)",
              borderRadius: "16px",
              padding: "36px",
              textAlign: "center",
              color: "var(--color-muted)",
            }}
          >
            <h2 className="type-section" style={{ color: "var(--color-carbon)" }}>
              가격 지수 데이터를 준비하고 있습니다
            </h2>
            <p className="type-copy">
              수집된 가격 근거를 검수하는 대로 이 페이지에서 중위가와 분포를 공개합니다.
            </p>
          </section>
        ) : (
          groups.map(([category, items]) => (
            <section key={category} style={{ display: "grid", gap: "12px" }}>
              <h2 className="type-section" style={{ margin: 0 }}>
                {categoryLabel(category)}
                <span style={{ marginLeft: "10px", fontSize: "13px", color: "var(--color-muted)", fontWeight: 400 }}>
                  {items.length}개 시술
                </span>
              </h2>
              <div style={{ display: "grid", gap: "10px" }}>
                {items.map((entry) => (
                  <Link
                    key={`${entry.canonical_treatment_name}-${entry.region}`}
                    href={`/prices/${encodeURIComponent(entry.canonical_treatment_name)}`}
                    style={{
                      display: "grid",
                      gap: "6px",
                      border: "1px solid var(--color-line)",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong style={{ fontSize: "16px", letterSpacing: "-0.01em" }}>
                        {entry.canonical_treatment_name}
                      </strong>
                      {gradeBadge(entry.confidence_grade)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        flexWrap: "wrap",
                        fontSize: "13px",
                        color: "var(--color-muted)",
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-carbon)" }}>
                        중위 {formatManwon(entry.median_price)}
                      </span>
                      <span>
                        범위 {formatManwon(entry.min_price)} ~ {formatManwon(entry.max_price)}
                      </span>
                      <span>근거 {entry.evidence_count}건</span>
                      {entry.last_evidence_at ? <span>{formatDateKo(entry.last_evidence_at)} 기준</span> : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}

          <PriceIndexNote />
          </div>
        </details>

        <section
          style={{
            border: "1px solid var(--color-line)",
            borderRadius: "16px",
            padding: "28px",
            display: "grid",
            gap: "14px",
            background: "var(--color-genius-yellow)",
          }}
        >
          <h2 className="type-section" style={{ margin: 0, color: "var(--color-carbon)" }}>
            내 조건의 실제 견적이 궁금하다면
          </h2>
          <p className="type-copy" style={{ margin: 0 }}>
            지수는 시장의 기준선입니다. 내 부위·예산에 맞는 실제 견적은 병원 역제안으로 받아볼 수
            있습니다.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/request" className="action-primary" style={{ textDecoration: "none" }}>
              내 조건으로 견적 요청하기
            </Link>
            <Link href="/recommend" className="ghost-link">
              AI 추천부터 받아보기
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
