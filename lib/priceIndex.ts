import { createClient } from "@supabase/supabase-js";
import localPriceIndex from "@/data/price-index-local.json";

/**
 * 탱글 프라이스 인덱스 공개 조회 레이어.
 *
 * 이 모듈은 anon 키로 공개 집계 테이블(price_index, price_index_evidence)만 읽는다.
 * 원본 price_evidence/price_sources 는 RLS로 차단되어 있으므로 여기서 조회하지 않는다.
 * Supabase 미적용·오류 시 data/price-index-local.json 폴백을 사용한다(병원명 없음).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: {
          fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 86400 } }),
        },
      })
    : null;

export type ConfidenceGrade = "high" | "medium" | "low";

export type PriceIndexEntry = {
  canonical_treatment_name: string;
  category: string | null;
  region: string;
  evidence_count: number;
  min_price: number | null;
  p25_price: number | null;
  median_price: number | null;
  p75_price: number | null;
  max_price: number | null;
  last_evidence_at: string | null;
  confidence_grade: ConfidenceGrade;
};

export type EvidenceKind = "regular" | "event" | "package" | "addon" | "unlimited";

export type PriceEvidenceRow = {
  id: number;
  canonical_treatment_name: string;
  category: string | null;
  region: string | null;
  evidence_kind: EvidenceKind;
  variant_text: string | null;
  package_components: string | null;
  session_count: number | null;
  price_manwon: number;
  unit_price_manwon: number | null;
  confidence: string | null;
  captured_date: string | null;
  source_type: string | null;
};

const localEntries = (localPriceIndex.entries ?? []) as PriceIndexEntry[];
const localEvidence = (localPriceIndex.evidence ?? []) as PriceEvidenceRow[];

function localEntriesSorted(): PriceIndexEntry[] {
  return [...localEntries].sort((a, b) => {
    const cat = String(a.category ?? "").localeCompare(String(b.category ?? ""), "ko");
    if (cat !== 0) return cat;
    return b.evidence_count - a.evidence_count;
  });
}

export async function getPriceIndexEntries(): Promise<PriceIndexEntry[]> {
  if (!supabase) return localEntriesSorted();
  try {
    const { data, error } = await supabase
      .from("price_index")
      .select(
        "canonical_treatment_name, category, region, evidence_count, min_price, p25_price, median_price, p75_price, max_price, last_evidence_at, confidence_grade",
      )
      .eq("region", "강남권")
      .order("category", { ascending: true })
      .order("evidence_count", { ascending: false });
    if (error || !data || data.length === 0) return localEntriesSorted();
    return data as PriceIndexEntry[];
  } catch {
    return localEntriesSorted();
  }
}

export async function getPriceIndexEntry(name: string): Promise<PriceIndexEntry | null> {
  const decoded = safeDecode(name);
  if (!supabase) {
    return localEntries.find((entry) => entry.canonical_treatment_name === decoded) ?? null;
  }
  try {
    const { data, error } = await supabase
      .from("price_index")
      .select(
        "canonical_treatment_name, category, region, evidence_count, min_price, p25_price, median_price, p75_price, max_price, last_evidence_at, confidence_grade",
      )
      .eq("canonical_treatment_name", decoded)
      .eq("region", "강남권")
      .order("evidence_count", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      return localEntries.find((entry) => entry.canonical_treatment_name === decoded) ?? null;
    }
    return data as PriceIndexEntry;
  } catch {
    return localEntries.find((entry) => entry.canonical_treatment_name === decoded) ?? null;
  }
}

export async function getPublicEvidenceRows(name: string): Promise<PriceEvidenceRow[]> {
  const decoded = safeDecode(name);
  if (!supabase) {
    return localEvidence
      .filter((row) => row.canonical_treatment_name === decoded)
      .sort(compareEvidence);
  }
  try {
    const { data, error } = await supabase
      .from("price_index_evidence")
      .select(
        "id, canonical_treatment_name, category, region, evidence_kind, variant_text, package_components, session_count, price_manwon, unit_price_manwon, confidence, captured_date, source_type",
      )
      .eq("canonical_treatment_name", decoded)
      .eq("region", "강남권")
      .order("unit_price_manwon", { ascending: true, nullsFirst: false });
    if (error || !data || data.length === 0) {
      return localEvidence
        .filter((row) => row.canonical_treatment_name === decoded)
        .sort(compareEvidence);
    }
    return data as PriceEvidenceRow[];
  } catch {
    return localEvidence
      .filter((row) => row.canonical_treatment_name === decoded)
      .sort(compareEvidence);
  }
}

function compareEvidence(a: PriceEvidenceRow, b: PriceEvidenceRow) {
  const aUnit = a.unit_price_manwon ?? Number.POSITIVE_INFINITY;
  const bUnit = b.unit_price_manwon ?? Number.POSITIVE_INFINITY;
  return aUnit - bUnit;
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function formatManwon(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  const rounded = Math.round(Number(value) * 10) / 10;
  const formatted = Number.isInteger(rounded)
    ? rounded.toLocaleString("ko-KR")
    : rounded.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${formatted}만원`;
}

export function formatDateKo(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

const CATEGORY_LABELS: Record<string, string> = {
  리프팅: "리프팅",
  스킨부스터: "스킨부스터",
  필러: "필러",
  보톡스: "보톡스",
  관리: "관리·주사",
  모공흉터: "모공·흉터",
  색소: "색소·레이저",
  바디라인: "바디라인",
  제모: "제모",
};

export function categoryLabel(category: string | null): string {
  if (!category) return "기타";
  return CATEGORY_LABELS[category] ?? category;
}

export const EVIDENCE_KIND_LABELS: Record<EvidenceKind, string> = {
  regular: "상시가",
  event: "이벤트가",
  package: "패키지",
  addon: "추가 옵션",
  unlimited: "무제한권",
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  public_image: "공개 가격 이미지",
  public_screenshot: "공개 화면 캡처",
  clinic_price_photo: "병원 가격표 사진",
};

export function gradeLabel(grade: ConfidenceGrade): string {
  if (grade === "high") return "표본 충분";
  if (grade === "medium") return "표본 보통";
  return "표본 적음";
}

const REQUEST_CATEGORY_MAP: Record<string, string> = {
  리프팅: "리프팅",
  스킨부스터: "스킨부스터",
  보톡스: "보톡스",
  관리: "관리",
  색소: "색소/레이저",
  모공흉터: "모공흉터",
  바디라인: "바디라인",
  제모: "제모",
};

export function requestCategoryFor(category: string | null): string {
  if (!category) return "기타";
  return REQUEST_CATEGORY_MAP[category] ?? "기타";
}
