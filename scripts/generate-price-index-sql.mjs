/**
 * 탱글 프라이스 인덱스 — 시드/마이그레이션 SQL + 로컬 폴백 JSON 생성기
 *
 * data/price-evidence-samples.json 을 읽어:
 *   - supabase/price_index_mvp.sql
 *   - data/price-index-local.json  (Supabase 미적용 시 페이지 폴백, 병원명 없음)
 * 를 생성합니다.
 *
 * 사용법: node scripts/generate-price-index-sql.mjs
 *
 * 규칙:
 * - 패키지(이름에 "+" 포함, package_components 존재, 섹션에 "패키지")는 중위값 집계에서 제외하고 원문만 공개
 * - "추가 혜택" 섹션은 addon 으로 분류해 집계 제외
 * - "무제한권"은 회차 환산 불가 → unit_price_manwon null, 집계 제외
 * - confidence: low 는 status='pending' (공개 스냅샷/집계 모두 제외, 재검수 대상)
 * - unit_price_manwon = price_manwon / session_count (1회·세션 기준 환산, 소수 1자리)
 * - MVP 지역: 강남권(강남·서초·송파)
 */

import { basename } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "data", "price-evidence-samples.json");
const outputSqlPath = path.join(root, "supabase", "price_index_mvp.sql");
const outputJsonPath = path.join(root, "data", "price-index-local.json");

const REGION_BY_SOURCE = {
  default: "강남권",
};

const data = JSON.parse(readFileSync(sourcePath, "utf8"));

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "null";
  return String(value);
}

function canonicalize(name) {
  return String(name).replace(/\s+/g, " ").trim();
}

function sourcePathOnly(filePath) {
  if (!filePath) return null;
  return basename(String(filePath).replaceAll("\\", "/"));
}

function parseSessionCount(variant) {
  if (!variant) return 1;
  if (/무제한/.test(variant)) return null;
  const match = String(variant).match(/(\d+)\s*회/);
  if (match) return Number(match[1]);
  return 1;
}

function classifyKind(item) {
  const name = item.treatment_name || "";
  const section = item.section || "";
  if (name.includes("+") || item.package_components || /패키지/.test(section)) return "package";
  if (/추가 혜택/.test(section) || /추가$/.test(name)) return "addon";
  if (/무제한/.test(item.variant || "") || /무제한/.test(name)) return "unlimited";
  if (/이벤트|런칭/.test(section)) return "event";
  return "regular";
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return Math.round((sorted[lo] * (1 - w) + sorted[hi] * w) * 10) / 10;
}

const sources = data.sources || [];
const evidenceRows = [];
let skippedLowConfidence = 0;

for (const source of sources) {
  const region = REGION_BY_SOURCE[source.source_id] || REGION_BY_SOURCE.default;
  for (const item of source.items || []) {
    const kind = classifyKind(item);
    const sessions = kind === "unlimited" ? null : parseSessionCount(item.variant);
    const unitPrice =
      sessions && item.price_manwon != null
        ? Math.round((Number(item.price_manwon) / sessions) * 10) / 10
        : null;
    const status = item.confidence === "low" ? "pending" : "approved";
    if (status === "pending") skippedLowConfidence += 1;

    evidenceRows.push({
      sourceKey: source.source_id,
      sourceType: source.source_type || null,
      capturedDate: source.captured_date || null,
      category: item.category || null,
      section: item.section || null,
      canonicalName: canonicalize(item.treatment_name),
      rawName: String(item.treatment_name).trim(),
      variant: item.variant || null,
      packageComponents: Array.isArray(item.package_components)
        ? item.package_components.join(", ")
        : null,
      areaScope: item.area_scope || null,
      sessionCount: sessions,
      quantityText: item.variant || null,
      priceManwon: item.price_manwon ?? null,
      confidence: item.confidence || "medium",
      status,
      region,
      kind,
      unitPrice,
      notes: item.notes || null,
    });
  }
}

const sourceInserts = sources
  .map((source) => {
    return `  (${sqlString(source.source_id)}, ${sqlString(source.clinic_name)}, ${sqlString(
      source.source_type,
    )}, ${sqlString(sourcePathOnly(source.source_file))}, ${sqlString(source.captured_date)})`;
  })
  .join(",\n");

const evidenceValues = evidenceRows
  .map((row) => {
    return `  ((select id from public.price_sources where source_key = ${sqlString(row.sourceKey)}), ${sqlString(
      row.category,
    )}, ${sqlString(row.section)}, ${sqlString(row.canonicalName)}, ${sqlString(row.rawName)}, ${sqlString(
      row.variant,
    )}, ${sqlString(row.packageComponents)}, ${sqlString(row.areaScope)}, ${sqlNumber(
      row.sessionCount,
    )}, ${sqlString(row.quantityText)}, ${sqlNumber(
      row.priceManwon != null ? Math.round(Number(row.priceManwon) * 10000) : null,
    )}, ${sqlNumber(row.priceManwon)}, ${sqlString(row.confidence)}, ${sqlString(row.status)}, ${sqlString(
      row.region,
    )}, ${sqlString(row.kind)}, ${sqlNumber(row.unitPrice)}, ${sqlString(row.notes)})`;
  })
  .join(",\n");

const sql = `-- ============================================================================
-- Tangle Price Index MVP — 통합 마이그레이션 + 시드
-- 생성: node scripts/generate-price-index-sql.mjs (${new Date().toISOString().slice(0, 10)})
-- 원본: data/price-evidence-samples.json (소스 ${sources.length}건, 근거 ${evidenceRows.length}건)
--
-- 실행 방법: Supabase Dashboard → SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
-- 프로젝트: hqqzhhqvlelonkaesbkq
-- 멱등 설계: 여러 번 실행해도 시드는 cnn-* 소스 기준으로 지우고 다시 넣습니다.
--
-- 공개 범위 (중요):
--   anon/authenticated 가 읽을 수 있는 것:
--     price_index, price_index_evidence, v_price_index_public (집계·비식별 스냅샷)
--   읽을 수 없는 것: price_evidence, price_sources, treatment_aliases (병원명·원본 경로 포함)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 증거 스키마 (price_data_schema.sql 과 호환, 없으면 생성 / 있으면 컬럼 보강)
-- ----------------------------------------------------------------------------
create table if not exists public.price_sources (
  id bigint generated always as identity primary key,
  clinic_name text,
  source_name text,
  source_type text not null,
  source_url text,
  source_path text,
  captured_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.price_sources add column if not exists source_key text;
alter table public.price_sources add column if not exists source_path text;
create unique index if not exists price_sources_source_key_key on public.price_sources(source_key);

create table if not exists public.treatment_aliases (
  id bigint generated always as identity primary key,
  canonical_name text not null,
  alias_name text not null,
  category text,
  created_at timestamptz not null default now(),
  unique(alias_name)
);

create table if not exists public.price_evidence (
  id bigint generated always as identity primary key,
  source_id bigint references public.price_sources(id) on delete set null,
  clinic_name text,
  category text not null,
  subcategory text,
  canonical_treatment_name text,
  raw_treatment_name text not null,
  treatment_variant text,
  package_components text,
  area_scope text,
  session_count int,
  quantity_text text,
  price_krw numeric,
  price_manwon numeric,
  currency text not null default 'KRW',
  vat_included boolean,
  confidence text not null default 'medium',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.price_evidence add column if not exists region text;
alter table public.price_evidence add column if not exists evidence_kind text not null default 'regular';
alter table public.price_evidence add column if not exists unit_price_manwon numeric;

create index if not exists idx_price_evidence_category on public.price_evidence(category);
create index if not exists idx_price_evidence_treatment on public.price_evidence(canonical_treatment_name);
create index if not exists idx_price_evidence_status on public.price_evidence(status);
create index if not exists idx_price_evidence_region on public.price_evidence(region);

-- ----------------------------------------------------------------------------
-- 2. 공개용 테이블 (병원명 없음 — 집계 + 비식별 근거 스냅샷)
-- ----------------------------------------------------------------------------
create table if not exists public.price_index (
  id bigint generated always as identity primary key,
  canonical_treatment_name text not null,
  category text,
  region text not null default '강남권',
  evidence_count int not null default 0,
  min_price numeric,
  p25_price numeric,
  median_price numeric,
  p75_price numeric,
  max_price numeric,
  last_evidence_at date,
  confidence_grade text not null default 'low',
  refreshed_at timestamptz not null default now(),
  unique(canonical_treatment_name, region)
);

create table if not exists public.price_index_evidence (
  id bigint generated always as identity primary key,
  canonical_treatment_name text not null,
  category text,
  region text,
  evidence_kind text not null default 'regular',
  variant_text text,
  package_components text,
  session_count int,
  price_manwon numeric not null,
  unit_price_manwon numeric,
  confidence text,
  captured_date date,
  source_type text,
  refreshed_at timestamptz not null default now()
);

-- 공개 집계 뷰 (anon-safe: 병원명·원본 경로 없음)
create or replace view public.v_price_index_public as
select
  canonical_treatment_name,
  category,
  region,
  evidence_count,
  min_price,
  p25_price,
  median_price,
  p75_price,
  max_price,
  last_evidence_at,
  confidence_grade,
  refreshed_at
from public.price_index;

-- ----------------------------------------------------------------------------
-- 3. RLS — 원본 증거는 비공개, 집계/스냅샷만 공개
-- ----------------------------------------------------------------------------
alter table public.price_sources enable row level security;
alter table public.treatment_aliases enable row level security;
alter table public.price_evidence enable row level security;
-- (정책을 만들지 않으므로 anon/authenticated 의 원본 조회는 차단됩니다)

alter table public.price_index enable row level security;
drop policy if exists price_index_public_read on public.price_index;
create policy price_index_public_read on public.price_index for select using (true);

alter table public.price_index_evidence enable row level security;
drop policy if exists price_index_evidence_public_read on public.price_index_evidence;
create policy price_index_evidence_public_read on public.price_index_evidence for select using (true);

grant select on public.price_index to anon, authenticated;
grant select on public.price_index_evidence to anon, authenticated;
grant select on public.v_price_index_public to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. 시드 — 소스 ${sources.length}건
-- ----------------------------------------------------------------------------
insert into public.price_sources (source_key, clinic_name, source_type, source_path, captured_date)
values
${sourceInserts}
on conflict (source_key) do nothing;

-- 같은 배치 재실행을 위해 기존 cnn-* 근거를 지우고 다시 넣습니다.
delete from public.price_evidence
where source_id in (select id from public.price_sources where source_key like 'cnn-%');

insert into public.price_evidence (
  source_id, category, subcategory, canonical_treatment_name, raw_treatment_name,
  treatment_variant, package_components, area_scope, session_count, quantity_text,
  price_krw, price_manwon, confidence, status, region, evidence_kind, unit_price_manwon, notes
)
values
${evidenceValues};

-- ----------------------------------------------------------------------------
-- 5. 공개 스냅샷 + 지수 집계 갱신
--    중위값은 1회·세션 환산가(unit_price_manwon) 기준, regular/event 만 포함
--    package/addon/unlimited 는 원문 공개만 하고 집계에서는 제외
--    MVP 지역 필터: 강남권
-- ----------------------------------------------------------------------------
truncate public.price_index_evidence;

insert into public.price_index_evidence (
  canonical_treatment_name, category, region, evidence_kind, variant_text,
  package_components, session_count, price_manwon, unit_price_manwon,
  confidence, captured_date, source_type
)
select
  e.canonical_treatment_name,
  e.category,
  coalesce(e.region, '강남권'),
  e.evidence_kind,
  e.treatment_variant,
  e.package_components,
  e.session_count,
  e.price_manwon,
  e.unit_price_manwon,
  e.confidence,
  s.captured_date,
  s.source_type
from public.price_evidence e
left join public.price_sources s on s.id = e.source_id
where e.status = 'approved'
  and e.canonical_treatment_name is not null
  and coalesce(e.region, '강남권') = '강남권';

truncate public.price_index;

insert into public.price_index (
  canonical_treatment_name, category, region, evidence_count,
  min_price, p25_price, median_price, p75_price, max_price,
  last_evidence_at, confidence_grade
)
select
  canonical_treatment_name,
  max(category) as category,
  region,
  count(*) as evidence_count,
  min(unit_price_manwon),
  percentile_cont(0.25) within group (order by unit_price_manwon),
  percentile_cont(0.5) within group (order by unit_price_manwon),
  percentile_cont(0.75) within group (order by unit_price_manwon),
  max(unit_price_manwon),
  max(captured_date) as last_evidence_at,
  case when count(*) >= 5 then 'high' when count(*) >= 3 then 'medium' else 'low' end
from public.price_index_evidence
where unit_price_manwon is not null
  and evidence_kind in ('regular', 'event')
  and region = '강남권'
group by canonical_treatment_name, region;

-- 확인용:
-- select canonical_treatment_name, region, evidence_count, median_price from public.v_price_index_public order by evidence_count desc;
-- select count(*) from public.price_index_evidence;  -- 병원명 컬럼이 없어야 함
`;

writeFileSync(outputSqlPath, sql, "utf8");

// --- 로컬 폴백 JSON (병원명 없음) ---
const approvedPublic = evidenceRows.filter((row) => row.status === "approved" && row.priceManwon != null);
let evidenceId = 1;
const publicEvidence = approvedPublic.map((row) => ({
  id: evidenceId++,
  canonical_treatment_name: row.canonicalName,
  category: row.category,
  region: row.region,
  evidence_kind: row.kind,
  variant_text: row.variant,
  package_components: row.packageComponents,
  session_count: row.sessionCount,
  price_manwon: row.priceManwon,
  unit_price_manwon: row.unitPrice,
  confidence: row.confidence,
  captured_date: row.capturedDate,
  source_type: row.sourceType,
}));

const byTreatment = new Map();
for (const row of publicEvidence) {
  if (row.unit_price_manwon == null) continue;
  if (row.evidence_kind !== "regular" && row.evidence_kind !== "event") continue;
  const key = `${row.canonical_treatment_name}::${row.region}`;
  const bucket = byTreatment.get(key) ?? {
    canonical_treatment_name: row.canonical_treatment_name,
    category: row.category,
    region: row.region,
    prices: [],
    dates: [],
  };
  bucket.prices.push(Number(row.unit_price_manwon));
  if (row.captured_date) bucket.dates.push(row.captured_date);
  if (!bucket.category && row.category) bucket.category = row.category;
  byTreatment.set(key, bucket);
}

const entries = [...byTreatment.values()].map((bucket) => {
  const prices = [...bucket.prices].sort((a, b) => a - b);
  const count = prices.length;
  return {
    canonical_treatment_name: bucket.canonical_treatment_name,
    category: bucket.category,
    region: bucket.region,
    evidence_count: count,
    min_price: prices[0] ?? null,
    p25_price: percentile(prices, 0.25),
    median_price: percentile(prices, 0.5),
    p75_price: percentile(prices, 0.75),
    max_price: prices[prices.length - 1] ?? null,
    last_evidence_at: bucket.dates.sort().at(-1) ?? null,
    confidence_grade: count >= 5 ? "high" : count >= 3 ? "medium" : "low",
  };
});

entries.sort((a, b) => {
  const cat = String(a.category ?? "").localeCompare(String(b.category ?? ""), "ko");
  if (cat !== 0) return cat;
  return b.evidence_count - a.evidence_count;
});

const localJson = {
  generated_at: new Date().toISOString(),
  region: "강남권",
  source_file: "data/price-evidence-samples.json",
  source_count: sources.length,
  evidence_count: evidenceRows.length,
  note: "Anon-safe local fallback. No hospital names. Prefer Supabase price_index when available.",
  entries,
  evidence: publicEvidence,
};

writeFileSync(outputJsonPath, `${JSON.stringify(localJson, null, 2)}\n`, "utf8");

const singleCount = evidenceRows.filter((row) => row.kind === "regular" || row.kind === "event").length;
const packageCount = evidenceRows.filter((row) => row.kind === "package").length;
const addonCount = evidenceRows.filter((row) => row.kind === "addon").length;
const unlimitedCount = evidenceRows.filter((row) => row.kind === "unlimited").length;

console.log(`생성 완료: ${outputSqlPath}`);
console.log(`생성 완료: ${outputJsonPath}`);
console.log(`소스 ${sources.length}건 / 근거 ${evidenceRows.length}건`);
console.log(`  - 단일 시술(regular/event): ${singleCount}건`);
console.log(`  - 패키지(집계 제외, 원문 공개): ${packageCount}건`);
console.log(`  - 추가 옵션(집계 제외): ${addonCount}건 / 무제한권: ${unlimitedCount}건`);
console.log(`  - low confidence → pending(재검수): ${skippedLowConfidence}건`);
console.log(`지수 생성 시술 수: ${entries.length}개`);
