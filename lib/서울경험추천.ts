import source from "../data/서울-경험추천-2026-10.json";

export type ClinicCategory = "skin" | "surgery" | "body";
export type ClinicStatus = "experience" | "confirm" | "insufficient" | "withheld";
export type ClinicProvider = {
  clinic: string | null;
  doctors: string[];
  location_hint: string | null;
  note: string | null;
};
export type ClinicRecommendation = {
  id: string;
  category: ClinicCategory;
  title: string;
  treatments: string[];
  aliases: string[];
  status: ClinicStatus;
  providers: ClinicProvider[];
  note: string | null;
  /** 이 분야를 더 깊게 정리한 탱글 가이드 경로 */
  guide_href?: string;
  source_text: string;
};

export const clinicRecommendationMeta = source.metadata;
export const clinicRecommendations = source.recommendations as ClinicRecommendation[];
export const clinicCategoryLabels: Record<ClinicCategory, string> = {
  skin: "피부 시술", surgery: "성형·모발", body: "체형·경락",
};
export const clinicStatusLabels: Record<ClinicStatus, string> = {
  experience: "경험 정보", confirm: "추가 확인 필요", insufficient: "데이터 부족", withheld: "비공개",
};

export function normalizeClinicSearch(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[\s·,()—/\-]+/g, "");
}

function searchText(item: ClinicRecommendation): string {
  return normalizeClinicSearch([
    item.title, ...item.treatments, ...item.aliases,
    ...item.providers.flatMap((provider) => [provider.clinic ?? "", ...provider.doctors, provider.location_hint ?? "", provider.note ?? ""]),
    item.source_text,
  ].join(" "));
}

/** 원문에 나온 시술·이름·지점 단서 검색. 여러 검색어는 AND로 적용합니다. */
export function getClinicRecommendations(
  query = "",
  category: ClinicCategory | "all" = "all",
  status: ClinicStatus | "all" = "all",
): ClinicRecommendation[] {
  const terms = query.trim().split(/\s+/).map(normalizeClinicSearch).filter(Boolean);
  return clinicRecommendations.filter((item) =>
    (category === "all" || item.category === category) &&
    (status === "all" || item.status === status) &&
    terms.every((term) => searchText(item).includes(term)),
  );
}

/** 자연어 질문의 명시적인 시술·병원·의료진 이름만 찾습니다. */
export function getClinicRecommendationsForQuestion(query: string): ClinicRecommendation[] {
  const normalized = normalizeClinicSearch(query);
  if (!normalized) return [];
  return clinicRecommendations.filter((item) => {
    const names = [...item.treatments, ...item.aliases, ...item.providers.flatMap((p) => [p.clinic ?? "", ...p.doctors])];
    return names.some((name) => {
      const key = normalizeClinicSearch(name);
      if (!key) return false;
      // ‘코스’의 코, ‘눈썹’의 눈을 별개의 코·눈 성형으로 매칭하지 않습니다.
      if (key.length === 1) {
        return new RegExp(`(^|[\\s,.!?])${key}(?=$|[\\s,.!?]|성형|수술|는|은|가|를|을)`, "u").test(query);
      }
      return normalized.includes(key);
    });
  });
}

function formatEntries(items: ClinicRecommendation[]): string {
  return items.map((item) => [
    `• ${item.title} [${clinicStatusLabels[item.status]}]`,
    `원문: ${item.source_text}`,
    item.note,
    ...item.providers.map((provider) => provider.note),
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function formatClinicRecommendationContext(query?: string): string {
  const items = query === undefined ? clinicRecommendations : getClinicRecommendationsForQuestion(query);
  if (!items.length) return "";
  return [
    "[서울 한정 개인 경험 참고자료 / 외부 검증 전]",
    clinicRecommendationMeta.source_claim,
    clinicRecommendationMeta.scope_note,
    clinicRecommendationMeta.notice,
    "시술 경험 시점은 알 수 없습니다. 아래 이름을 현재 소속으로 확정하거나 명의·안전성·효과·예약 가능 여부를 보장하지 마세요. 병원명을 추정하지 마세요. 데이터 부족과 비공개는 추천 대상이 아닙니다.",
    formatEntries(items),
  ].join("\n\n");
}

/** 모델 없이도 출처와 불확실성을 유지하는 특정 항목 안내입니다. */
export function findClinicRecommendationText(query: string): string {
  const items = getClinicRecommendationsForQuestion(query);
  if (!items.length) return "";
  return [
    "사용자가 공유한 서울 개인 경험 목록에는 다음 내용이 있습니다. 병원명·현재 소속·운영 여부는 외부 검증 전이며, 추천 순위나 안전성·효과를 보장하지 않습니다.",
    formatEntries(items),
    "전체 25개 항목과 원문은 서울 경험 추천(/clinics)에서 확인할 수 있습니다.",
  ].join("\n\n");
}
