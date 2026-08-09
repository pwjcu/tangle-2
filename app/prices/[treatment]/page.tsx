import type { Metadata } from "next";
import Link from "next/link";
import PriceIndexNote from "../../components/PriceIndexNote";
import {
  EVIDENCE_KIND_LABELS,
  SOURCE_TYPE_LABELS,
  categoryLabel,
  formatDateKo,
  formatManwon,
  getPriceIndexEntries,
  getPriceIndexEntry,
  getPublicEvidenceRows,
  gradeLabel,
  requestCategoryFor,
  safeDecode,
  type PriceEvidenceRow,
  type PriceIndexEntry,
} from "@/lib/priceIndex";

export const revalidate = 86400;
export const dynamicParams = true;

type PageProps = { params: Promise<{ treatment: string }> };

export async function generateStaticParams() {
  const entries = await getPriceIndexEntries();
  return entries.map((entry) => ({ treatment: entry.canonical_treatment_name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { treatment: raw } = await params;
  const treatment = safeDecode(raw);
  const entry = await getPriceIndexEntry(treatment);
  if (!entry) {
    // 지수에 없는 시술은 색인 대상이 아니므로 noindex
    return { title: "시술 가격 지수", robots: { index: false, follow: false } };
  }
  const name = entry.canonical_treatment_name;
  const title = `${name} 가격 — 강남권 중위가 ${formatManwon(entry.median_price)}`;
  const description = `${name} 강남권 공개 가격 분포: 중위 ${formatManwon(
    entry.median_price,
  )}, 범위 ${formatManwon(entry.min_price)}~${formatManwon(entry.max_price)} (1회·세션 환산, 근거 ${
    entry.evidence_count
  }건, ${formatDateKo(entry.last_evidence_at)} 기준). 병원명 없이 분포만 공개합니다.`;
  return {
    title,
    description,
    alternates: { canonical: `/prices/${encodeURIComponent(name)}` },
    openGraph: { title, description, type: "article" },
  };
}

function DistributionBar({ entry }: { entry: PriceIndexEntry }) {
  const min = Number(entry.min_price ?? 0);
  const max = Number(entry.max_price ?? 0);
  const p25 = Number(entry.p25_price ?? min);
  const p75 = Number(entry.p75_price ?? max);
  const median = Number(entry.median_price ?? min);
  const span = max - min;
  const pct = (value: number) => (span <= 0 ? 50 : Math.min(100, Math.max(0, ((value - min) / span) * 100)));

  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <div
        role="img"
        aria-label={`가격 범위 ${formatManwon(min)}에서 ${formatManwon(max)}, 중앙 50% 구간 ${formatManwon(
          p25,
        )}~${formatManwon(p75)}, 중위 ${formatManwon(median)}`}
        style={{
          position: "relative",
          height: "12px",
          borderRadius: "999px",
          background: "var(--color-silver-mist)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${pct(p25)}%`,
            width: `${Math.max(2, pct(p75) - pct(p25))}%`,
            top: 0,
            bottom: 0,
            background: "var(--color-genius-yellow)",
            borderRadius: "999px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(${pct(median)}% - 2px)`,
            top: "-4px",
            bottom: "-4px",
            width: "4px",
            borderRadius: "2px",
            background: "var(--color-carbon)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "var(--color-muted)",
        }}
      >
        <span>최저 {formatManwon(min)}</span>
        <span style={{ color: "var(--color-carbon)", fontWeight: 600 }}>
          중위 {formatManwon(median)}
        </span>
        <span>최고 {formatManwon(max)}</span>
      </div>
    </div>
  );
}

function kindBadge(kind: PriceEvidenceRow["evidence_kind"]) {
  const isEventLike = kind === "event" || kind === "package" || kind === "addon" || kind === "unlimited";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: isEventLike ? "#b45309" : "var(--color-muted)",
        border: "1px solid var(--color-line)",
        borderRadius: "999px",
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {EVIDENCE_KIND_LABELS[kind] ?? kind}
    </span>
  );
}

function EvidenceCard({ row }: { row: PriceEvidenceRow }) {
  const title = row.variant_text ?? "기본 구성";
  return (
    <div
      style={{
        border: "1px solid var(--color-line)",
        borderRadius: "12px",
        padding: "14px 16px",
        display: "grid",
        gap: "6px",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <strong style={{ fontSize: "14px" }}>
          {title}
          {row.package_components ? (
            <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>
              {" "}
              (+ {row.package_components})
            </span>
          ) : null}
        </strong>
        {kindBadge(row.evidence_kind)}
      </div>
      <div style={{ fontSize: "14px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "baseline" }}>
        <span>
          표기가 <strong>{formatManwon(row.price_manwon)}</strong>
          {(row.session_count ?? 1) > 1 ? (
            <span style={{ color: "var(--color-muted)", fontWeight: 400 }}> ({row.session_count}회)</span>
          ) : null}
        </span>
        {row.unit_price_manwon != null ? (
          <span style={{ color: "var(--color-muted)" }}>
            1회·세션 환산 <strong style={{ color: "var(--color-carbon)" }}>{formatManwon(row.unit_price_manwon)}</strong>
          </span>
        ) : (
          <span style={{ color: "var(--color-muted)" }}>1회·세션 환산 불가</span>
        )}
      </div>
      <div style={{ fontSize: "12px", color: "var(--color-muted)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <span>{SOURCE_TYPE_LABELS[row.source_type ?? ""] ?? "공개 자료"}</span>
        {row.captured_date ? <span>수집일 {formatDateKo(row.captured_date)}</span> : null}
      </div>
    </div>
  );
}

export default async function PriceTreatmentPage({ params }: PageProps) {
  const { treatment: raw } = await params;
  const treatment = safeDecode(raw);
  const [entry, rows] = await Promise.all([getPriceIndexEntry(treatment), getPublicEvidenceRows(treatment)]);

  // 지수 미등록 시술도 기존 페이지에서 딥링크로 들어오므로 404 대신 안내 상태를 보여준다
  const hasAnyData = Boolean(entry) || rows.length > 0;

  const name = entry?.canonical_treatment_name ?? treatment;
  const singleRows = rows.filter((row) => row.evidence_kind === "regular" || row.evidence_kind === "event");
  const packageRows = rows.filter(
    (row) => row.evidence_kind === "package" || row.evidence_kind === "addon" || row.evidence_kind === "unlimited",
  );
  const requestHref = `/request?category=${encodeURIComponent(
    requestCategoryFor(entry?.category ?? rows[0]?.category ?? null),
  )}&budget=${entry?.median_price ?? ""}&symptom=${encodeURIComponent(
    `${name} 시술에 관심이 있습니다. 가격 지수를 보고 문의합니다.`,
  )}`;

  const jsonLd = entry
    ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${name} 강남권 가격 분포 (탱글 프라이스 인덱스)`,
        description: `${name}의 강남권 공개 가격 근거 ${entry.evidence_count}건을 1회·세션 환산으로 집계한 분포. 중위 ${formatManwon(
          entry.median_price,
        )}, 범위 ${formatManwon(entry.min_price)}~${formatManwon(entry.max_price)}.`,
        temporalCoverage: entry.last_evidence_at ?? undefined,
        spatialCoverage: "서울 강남권(강남·서초·송파)",
        isAccessibleForFree: true,
      }
    : null;

  return (
    <main>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
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
            <Link href="/prices" className="ghost-link">
              가격 지수
            </Link>
            <Link href="/request" className="ghost-link">
              견적 요청
            </Link>
          </nav>
        </div>
      </header>

      <div className="shell" style={{ padding: "48px 24px 72px", display: "grid", gap: "36px", maxWidth: "860px" }}>
        <section>
          <span className="eyebrow">
            Tangle Price Index · {entry?.region ?? rows[0]?.region ?? "강남권"} ·{" "}
            {categoryLabel(entry?.category ?? rows[0]?.category ?? null)}
          </span>
          <h1 className="type-title" style={{ fontSize: "38px", margin: "14px 0 16px" }}>
            {name} 가격
          </h1>
          {entry ? (
            <>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  중위 {formatManwon(entry.median_price)}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--color-muted)",
                    border: "1px solid var(--color-line)",
                    borderRadius: "999px",
                    padding: "3px 8px",
                  }}
                >
                  {gradeLabel(entry.confidence_grade)} · 근거 {entry.evidence_count}건
                </span>
              </div>
              <p className="type-copy" style={{ marginTop: "10px" }}>
                1회·세션 환산 기준, 범위 {formatManwon(entry.min_price)} ~ {formatManwon(entry.max_price)}
                {entry.last_evidence_at ? ` · ${formatDateKo(entry.last_evidence_at)} 수집분 기준` : ""}.
                부위·샷 수·용량에 따라 달라질 수 있으니 아래 원문 근거를 함께 확인하세요.
              </p>
            </>
          ) : (
            <p className="type-copy">
              {hasAnyData
                ? "이 시술은 아직 단일 시술 기준 분포를 계산할 근거가 부족합니다. 수집된 원문 근거만 먼저 공개합니다."
                : "이 시술은 아직 가격 지수에 수집된 근거가 없습니다. 새 근거가 검수되어 반영되면 이 페이지에서 분포를 확인할 수 있습니다."}
            </p>
          )}
        </section>

        {entry ? (
          <section style={{ display: "grid", gap: "10px" }}>
            <h2 className="type-section" style={{ margin: 0, fontSize: "18px" }}>
              가격 분포
            </h2>
            <DistributionBar entry={entry} />
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-muted)" }}>
              노란 구간은 전체 근거의 중앙 50%(하위 25% ~ 상위 75%), 검은 표시는 중위값입니다.
            </p>
          </section>
        ) : null}

        {singleRows.length > 0 ? (
          <section style={{ display: "grid", gap: "12px" }}>
            <h2 className="type-section" style={{ margin: 0, fontSize: "18px" }}>
              가격 근거 ({singleRows.length}건)
            </h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {singleRows.map((row) => (
                <EvidenceCard key={row.id} row={row} />
              ))}
            </div>
          </section>
        ) : null}

        {packageRows.length > 0 ? (
          <section style={{ display: "grid", gap: "12px" }}>
            <h2 className="type-section" style={{ margin: 0, fontSize: "18px" }}>
              함께 묶인 패키지·옵션 ({packageRows.length}건)
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-muted)" }}>
              다른 시술과 결합된 구성은 중위값 계산에서 제외하고 원문만 공개합니다.
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              {packageRows.map((row) => (
                <EvidenceCard key={row.id} row={row} />
              ))}
            </div>
          </section>
        ) : null}

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
            {name}, 내 조건 실제 견적 받아보기
          </h2>
          <p className="type-copy" style={{ margin: 0 }}>
            중위가는 시장 기준선입니다. 내 부위·예산에 맞는 견적을 병원 역제안으로 받아보세요.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href={requestHref} className="action-primary" style={{ textDecoration: "none" }}>
              이 시술로 견적 요청하기
            </Link>
            <Link href="/prices" className="ghost-link">
              다른 시술 지수 보기
            </Link>
          </div>
        </section>

        <PriceIndexNote />
      </div>
    </main>
  );
}
