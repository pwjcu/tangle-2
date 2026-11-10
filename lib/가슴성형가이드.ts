import source from "../data/가슴성형-가이드-2026-11.json";

export type GuideFact = { text: string; url: string; source: string };
export type BreastImplant = {
  id: string;
  name: string;
  maker: string;
  price: string | null;
  feel: string;
  strengths: string;
  cautions: string;
  fit: string;
  long_term_data: "많음" | "중간" | "적음";
  facts?: GuideFact[];
};
export type GuideComparison = { id: string; title: string; a: string; b: string; lead: string; rows: [string, string, string][] };
export type GuideTip = { title: string; detail: string | null };

export const breastGuideMeta = source.metadata;
export const breastGuideSummary = source.summary;
export const breastGuidePriority = source.priority as GuideTip[];
export const breastImplants = source.implants as BreastImplant[];
export const breastImplantNote = source.implant_note;
export const breastDiscontinued = source.discontinued;
export const breastComparisons = source.comparisons as GuideComparison[];
export const breastAdvice = source.advice as GuideTip[];
export const breastChecklist = source.checklist as GuideTip[];
export const breastGuideSources = source.sources;

/** 챗 안내용 요약. 모델 없이도 출처·불확실성을 유지합니다. */
export function formatBreastGuideText(): string {
  return [
    "탱글 가슴성형 가이드(/guide/breast) 요약입니다. 운영진의 서울 성형외과 10곳 상담 경험과 의료진 지인 의견을 정리한 참고 자료이며, 진단이나 병원·제품 추천이 아닙니다.",
    breastGuideSummary,
    `결과를 좌우하는 순서: ${breastGuidePriority.map((item) => item.title).join(" > ")}`,
    breastImplants.filter((item) => item.price).map((item) => `• ${item.name}: 상담가 ${item.price}, ${item.fit}`).join("\n"),
    breastGuideMeta.price_note,
  ].join("\n\n");
}
