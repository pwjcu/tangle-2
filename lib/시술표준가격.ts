import importedPrices from "../data/시술-표준가격-2026-10.json";

export type StandardTreatmentPrice = {
  id: string;
  treatment_name: string;
  category: string;
  aliases: string[];
  variant: string;
  min_price_manwon: number;
  max_price_manwon: number;
  average_price_manwon: number | null;
  kind: "single" | "package" | "combination" | "unlimited";
  session_count: number | null;
  note: string | null;
  source_urls: string[];
};

/** 첨부 요약문의 주장과 이번 가져오기에서 확인한 범위를 구분한 메타데이터입니다. */
export const standardPriceMeta = importedPrices.metadata;

/** 만원 단위의 사용자 제공 요약 가격입니다. 병원별 원시 가격 관측값은 아닙니다. */
export const standardTreatmentPrices = importedPrices.treatments as StandardTreatmentPrice[];

function normalizeTreatmentName(name: string) {
  return name.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

/** 이름 또는 명시된 별칭이 정확하게 일치하는 시술의 모든 규격을 반환합니다. */
export function getStandardPricesForTreatment(name: string): StandardTreatmentPrice[] {
  const normalizedName = normalizeTreatmentName(name);
  if (!normalizedName) return [];

  return standardTreatmentPrices.filter((price) =>
    [price.treatment_name, ...price.aliases].some(
      (candidate) => normalizeTreatmentName(candidate) === normalizedName,
    ),
  );
}

export function getStandardPriceTreatmentNames(): string[] {
  return [...new Set(standardTreatmentPrices.map((price) => price.treatment_name))];
}
