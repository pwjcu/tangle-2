import source from "../data/서울-경험추천-2026-10.json";

export type ClinicCategory = "skin" | "surgery" | "body" | "dental";
export type ClinicStatus = "experience" | "confirm" | "insufficient" | "withheld";
export type ClinicProvider = {
  clinic: string | null;
  doctors: string[];
  location_hint: string | null;
  note: string | null;
  /** 탱글 운영진이 직접 수술·시술을 받은 경험 요약 */
  experience?: string;
  /** 링크 정보가 있는 병원 id (lib/협업병원.ts) */
  partner_id?: string;
  /** 서울 밖 병원의 지역 (예: 대구) */
  region?: string;
  address?: string;
  links?: { kind: "website" | "booking" | "kakao" | "instagram" | "phone"; url: string }[];
};
export type ClinicRecommendation = {
  id: string;
  category: ClinicCategory;
  title: string;
  /** 앱에 보여 줄 한 줄 소개 */
  summary: string;
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
export const hasFirsthand = (item: ClinicRecommendation) => item.providers.some((provider) => Boolean(provider.experience));
export const clinicRecommendations = source.recommendations as ClinicRecommendation[];

/** 경험 본문이 없는 추천에서 공통으로 확인할 상담 질문. */
export const clinicConsultationChecks: Record<string, string> = {
  "skin-injections": "스킨보톡스는 제품·부위·유닛, 리쥬란은 제품 종류·cc를 각각 확인해 보세요. 마취와 진정 관리까지 포함한 금액인지 물어보면 견적을 비교하기 쉬워요.",
  rituo: "리투오의 1회 용량과 단독·복합 시술 여부를 확인해 보세요. 마취 방식과 시술 후 붓기가 가라앉는 데 얼마나 걸릴지도 물어보세요.",
  "sofwave-toning-hair-removal": "소프웨이브는 시술 범위와 샷 수, 토닝은 사용하는 장비, 제모는 부위와 회차를 각각 확인해 보세요.",
  "custom-hand-injections": "담당 원장이 직접 주사하는 범위, 제품명과 총 용량, 부위별 마취와 추가 비용을 확인해 보세요.",
  "thread-lifting-fillers": "실리프팅은 실 종류와 개수, 필러는 제품명과 부위별 cc를 확인해 보세요. 압토스를 원하면 실제 사용 여부도 물어보세요.",
  "acne-scars": "진료에서 흉터 유형을 어떻게 나누는지, 어떤 치료를 몇 회 제안하는지, 시술 사이 회복 기간은 얼마인지 물어보세요.",
  "acne-hair-removal": "원장님의 현재 소속을 먼저 확인해 주세요. 여드름 진료와 제모를 같은 날 할 수 있는지, 제모 장비와 부위별 회차도 함께 물어보세요.",
  "hair-transplant": "절개·비절개별 예상 모낭 수와 실제 채취·이식을 담당하는 의료진, 수술 후 점검 일정을 확인해 보세요.",
  nose: "첫 수술인지 재수술인지 알려 주고, 자가늑 등 권하는 재료와 선택 이유를 물어보세요. 마취와 재진 비용도 견적에서 확인해 보세요.",
  "facial-contouring": "광대·턱끝·사각턱 중 제안받은 부위, 영상 검사 비용, 수술 후 점검 일정을 확인해 보세요.",
  eyes: "쌍꺼풀과 트임을 각각 상담하고, 수술 방식과 담당 원장, 실밥 제거와 재진 일정을 확인해 보세요.",
  breast: "보형물 브랜드·모델·크기와 절개 위치를 비교해 보세요. 검사·마취·보정 속옷·재진이 견적에 들어 있는지도 물어보세요.",
  "face-lift": "안면거상과 목거상을 각각 하는지, 절개 범위와 마취 방식은 무엇인지, 수술 후 점검과 실밥 제거는 언제인지 확인해 보세요.",
  profound: "예약 전에 프로파운드 장비 운영 여부와 담당 원장을 확인해 주세요. 다른 장비를 제안받으면 시술 범위와 견적을 따로 받아 보세요.",
  thermage: "얼굴용과 아이 팁을 구분하고 FLX 장비 여부와 샷 수, 마취 비용이 포함되는지 확인해 보세요.",
  "shape-consulting": "얼굴 전체 상담에서 우선순위로 본 부위와 이유, 부위별 시술을 한 번에 할지 단계적으로 할지를 물어보세요.",
  "eyebrow-tattoo": "원하는 모양과 기존 색소 유무를 알려 주고, 디자인 상담과 리터치 일정·비용을 확인해 보세요.",
  "renuvion-general-skin": "원하는 시술명과 장비 명칭을 알려 주고 현재 운영 여부, 일반 피부 진료와 시술 상담의 예약 경로를 확인해 보세요.",
  inmode: "FX와 포르마를 구분하고, 원하는 부위에서 실제 시술에 걸리는 시간과 모드별 추가 비용을 물어보세요.",
  "ulthera-thermage-output": "장비 모델, 샷 수, 팁과 부위를 확인하고 피부 상태에 따라 출력과 깊이를 어떻게 정하는지 상담해 보세요.",
  "body-care": "첫 방문에 포함되는 상담·검사와 관리 방식, 회차별 비용을 확인해 보세요.",
  massage: "얼굴·전신 중 관리 범위와 실제 소요 시간, 단회권과 회차권의 조건을 각각 확인해 보세요.",
  nasolabial: "진료에서 주름의 원인을 어떻게 판단하고 어떤 방법을 제안하는지, 시술 범위와 비용을 물어보세요.",
  "global-skin": "예약할 지점에 원하는 언어로 상담·통역이 가능한지, 그 언어로 사후 안내를 받을 수 있는지 먼저 확인해 주세요.",
  "skin-doctors-top": "의료진의 현재 소속과 첫 상담 가능 일정, 진료와 미용 시술의 예약 경로를 확인해 보세요.",
  implant: "임플란트 브랜드와 지대주·보철 재료를 확인해 보세요. 뼈 이식, CT, 임시치아가 견적에 포함되는지도 물어보세요.",
  whitening: "1회 방문당 적용 횟수와 재료, 기존 시린 증상이나 보철이 있을 때 고려할 점, 추가 회차 비용을 확인해 보세요.",
};
export const clinicCategoryLabels: Record<ClinicCategory, string> = {
  skin: "피부", surgery: "성형", body: "체형·경락", dental: "치과",
};
/** 화면에서는 피부(피부 시술 + 체형·경락)와 성형 두 갈래로 크게 나눕니다. */
export const clinicGroups: readonly { id: ClinicCategory; label: string; detail: string; categories: readonly ClinicCategory[] }[] = [
  { id: "skin", label: "피부", detail: "주사·리프팅·레이저·관리", categories: ["skin", "body"] },
  { id: "surgery", label: "성형", detail: "눈·코·윤곽·가슴·거상·모발이식", categories: ["surgery"] },
  { id: "dental", label: "치과", detail: "임플란트·교정·미백·일반 진료", categories: ["dental"] },
];

export const clinicStatusLabels: Record<ClinicStatus, string> = {
  experience: "경험 정보", confirm: "추가 확인 필요", insufficient: "데이터 부족", withheld: "비공개",
};

export function normalizeClinicSearch(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[\s·,()—/\-]+/g, "");
}

function searchText(item: ClinicRecommendation): string {
  return normalizeClinicSearch([
    item.title, ...item.treatments, ...item.aliases,
    ...item.providers.flatMap((provider) => [provider.clinic ?? "", ...provider.doctors, provider.location_hint ?? "", provider.note ?? "", provider.experience ?? "", provider.region ?? "", provider.address ?? ""]),
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
    (category === "all" || item.category === category || (category === "skin" && item.category === "body")) &&
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
    item.summary,
    item.note,
    ...item.providers.map((provider) => `- ${provider.clinic ?? "병원 확인 중"}${provider.region ? ` (${provider.region})` : ""}${provider.doctors.length ? ` · ${provider.doctors.join("·")} 원장` : ""}${provider.note ? ` · ${provider.note}` : ""}`),
    ...item.providers.filter((provider) => provider.experience).map((provider) => `운영진 직접 경험(${provider.clinic}): ${provider.experience}`),
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function formatClinicRecommendationContext(query?: string): string {
  const items = query === undefined ? clinicRecommendations : getClinicRecommendationsForQuestion(query);
  if (!items.length) return "";
  return [
    "[탱글 추천 병원 — 개인 경험 참고자료 / 외부 검증 전]",
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
    "탱글 추천 병원에서 찾았어요. 개인 경험을 모은 참고 정보이니, 방문 전 병원 정보를 한 번 확인해 주세요.",
    formatEntries(items),
    `전체 ${clinicRecommendations.length}개 분야는 추천 병원(/clinics)에서 볼 수 있어요.`,
  ].join("\n\n");
}
