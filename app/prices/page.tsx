import type { Metadata } from "next";
import Link from "next/link";
import PriceIndexNote from "../components/PriceIndexNote";
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
  title: "시술 가격 지수 — 강남권 피부 시술 중위가·분포",
  description:
    "리프팅·스킨부스터·필러·보톡스 등 강남권(강남·서초·송파) 피부 시술의 공개 가격 근거를 모아 중위가와 가격 범위를 정리했습니다. 병원명 없이 분포만 공개하는 탱글 프라이스 인덱스.",
  alternates: { canonical: "/prices" },
  openGraph: {
    title: "탱글 프라이스 인덱스 — 시술 가격의 기준선",
    description:
      "강남권 피부 시술 가격을 중위가·분포·근거 수로 정리한 공개 지수. 수집일과 근거 유형을 함께 표기합니다.",
    type: "website",
  },
};

const CATEGORY_ORDER = ["리프팅", "스킨부스터", "필러", "보톡스", "색소", "모공흉터", "관리"];

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
  const totalEvidence = entries.reduce((sum, entry) => sum + entry.evidence_count, 0);
  const latestAsOf = entries
    .map((entry) => entry.last_evidence_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return (
    <main>
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.86)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-line)",
          zIndex: 10,
        }}
      >
        <div
          className="shell"
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Tangle
          </Link>
          <nav style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <Link href="/recommend" className="ghost-link">
              AI 추천
            </Link>
            <Link href="/request" className="ghost-link">
              견적 요청
            </Link>
          </nav>
        </div>
      </header>

      <div className="shell" style={{ padding: "48px 24px 72px", display: "grid", gap: "36px" }}>
        <section>
          <span className="eyebrow">Tangle Price Index · 강남권</span>
          <h1 className="type-title" style={{ fontSize: "42px", margin: "14px 0 16px" }}>
            시술 가격, 이제 분포로 확인하세요
          </h1>
          <p className="type-copy" style={{ maxWidth: "640px" }}>
            공개된 가격 근거를 모아 시술별 중위가와 가격 범위를 정리했습니다. 병원명은 공개하지 않고,
            수집일과 근거 수를 함께 보여줍니다. 현재 지역은 강남권(강남·서초·송파) 수집분입니다.
          </p>
          {entries.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "20px",
                fontSize: "13px",
                color: "var(--color-muted)",
              }}
            >
              <span style={{ border: "1px solid var(--color-line)", borderRadius: "999px", padding: "6px 12px" }}>
                집계 시술 {entries.length}개
              </span>
              <span style={{ border: "1px solid var(--color-line)", borderRadius: "999px", padding: "6px 12px" }}>
                공개 근거 {totalEvidence}건
              </span>
              {latestAsOf ? (
                <span style={{ border: "1px solid var(--color-line)", borderRadius: "999px", padding: "6px 12px" }}>
                  최근 수집일 {formatDateKo(latestAsOf)}
                </span>
              ) : null}
            </div>
          ) : null}
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

        <PriceIndexNote />
      </div>
    </main>
  );
}
