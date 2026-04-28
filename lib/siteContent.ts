export type AccentName = "rose" | "sky" | "amber" | "emerald" | "violet" | "slate";

export interface CategoryMeta {
  name: string;
  headline: string;
  description: string;
  examples: string;
  audience: string;
  accent: AccentName;
  concernTags: string[];
}

export const accentStyles: Record<
  AccentName,
  { chip: string; surface: string; border: string; text: string }
> = {
  rose: {
    chip: "bg-rose-100 text-rose-700",
    surface: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
  },
  sky: {
    chip: "bg-sky-100 text-sky-700",
    surface: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700",
    surface: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-700",
    surface: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  violet: {
    chip: "bg-violet-100 text-violet-700",
    surface: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
  },
  slate: {
    chip: "bg-slate-200 text-slate-700",
    surface: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-700",
  },
};

export const treatmentCategories: CategoryMeta[] = [
  {
    name: "리프팅",
    headline: "처짐과 윤곽 고민을 빠르게 정리하는 탄력 시술",
    description:
      "울쎄라, 써마지처럼 예산대가 큰 대신 체감 변화가 빠른 시술군입니다.",
    examples: "울쎄라 · 써마지 · 슈링크",
    audience: "턱선, 볼 처짐, 전반적인 탄력 저하가 고민인 경우",
    accent: "rose",
    concernTags: ["탄력/리프팅", "주름/노화", "윤곽"],
  },
  {
    name: "스킨부스터",
    headline: "잔주름과 피부결을 끌어올리는 회복형 시술",
    description:
      "리쥬란, 쥬베룩처럼 피부결과 광채를 개선하는 시술군입니다.",
    examples: "리쥬란 · 쥬베룩 · 스킨보톡스",
    audience: "자연스럽게 피부 컨디션을 끌어올리고 싶은 경우",
    accent: "sky",
    concernTags: ["피부결/모공", "탄력/리프팅", "잡티/색소"],
  },
  {
    name: "보톡스",
    headline: "잔주름과 라인을 가볍게 정리하는 빠른 선택지",
    description:
      "비교적 낮은 예산으로도 변화 체감을 기대할 수 있는 기본 시술군입니다.",
    examples: "보톡스 · 윤곽보톡스 · 필러",
    audience: "짧은 다운타임으로 표정 주름이나 라인을 정리하고 싶은 경우",
    accent: "amber",
    concernTags: ["주름/노화", "윤곽"],
  },
  {
    name: "관리",
    headline: "자극은 낮추고 컨디션은 끌어올리는 유지 관리형 시술",
    description:
      "LDM, 진정, 저자극 관리처럼 다운타임 부담이 적은 시술군입니다.",
    examples: "LDM · 진정관리 · 물광관리",
    audience: "예민 피부이거나 시술 입문 단계인 경우",
    accent: "emerald",
    concernTags: ["피부결/모공", "잡티/색소", "여드름/흉터"],
  },
  {
    name: "모공흉터",
    headline: "흉터와 모공처럼 누적 고민을 다루는 개선형 시술",
    description:
      "프락셀, 포텐자 계열처럼 회복과 효과를 같이 고려해야 하는 시술군입니다.",
    examples: "프락셀 · 포텐자 · 서브시전",
    audience: "여드름 흉터, 넓은 모공, 피부결 울퉁불퉁함이 고민인 경우",
    accent: "violet",
    concernTags: ["여드름/흉터", "피부결/모공"],
  },
  {
    name: "제모",
    headline: "반복 비용을 줄여주는 실용형 시술",
    description:
      "부위별 반복 시술이 필요한 만큼 가격과 병원 경험을 같이 비교해야 합니다.",
    examples: "얼굴 제모 · 인중 제모 · 바디 제모",
    audience: "가격과 접근성을 우선적으로 보고 싶은 경우",
    accent: "slate",
    concernTags: ["제모"],
  },
];

export function getCategoryMeta(name: string) {
  return (
    treatmentCategories.find((category) => category.name === name) ?? {
      name,
      headline: "시술 정보를 비교하며 나에게 맞는 선택지를 찾으세요.",
      description:
        "가격 범위, 회복 기간, 주의사항을 함께 보고 불필요한 시술을 걸러내는 것이 중요합니다.",
      examples: "개별 시술 데이터 확인",
      audience: "팩트 기반 비교가 필요한 모든 사용자",
      accent: "slate" as AccentName,
      concernTags: [],
    }
  );
}
