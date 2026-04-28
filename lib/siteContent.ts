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
    headline: "처짐과 탄력 저하를 빠르게 체감하기 위한 메인 카테고리",
    description:
      "울쎄라, 써마지처럼 탄력 체감이 큰 시술이 포함됩니다. 예산이 높아질수록 조합 폭도 함께 넓어집니다.",
    examples: "울쎄라, 써마지, 인모드, 실리프팅",
    audience: "턱선 처짐, 볼 탄력 저하, 전체적인 탄력 고민이 큰 경우",
    accent: "rose",
    concernTags: ["탄력/리프팅", "주름/노화"],
  },
  {
    name: "스킨부스터",
    headline: "피부결과 보습, 잔주름 인상을 부드럽게 다듬는 카테고리",
    description:
      "리쥬란, 쥬베룩, 스킨부스터 계열처럼 피부 컨디션을 끌어올리는 시술이 모여 있습니다.",
    examples: "리쥬란, 쥬베룩, 물광·재생 주사",
    audience: "자연스럽게 피부결과 보습감을 끌어올리고 싶은 경우",
    accent: "sky",
    concernTags: ["피부결/모공", "잡티/색소"],
  },
  {
    name: "보톡스",
    headline: "표정 주름이나 라인을 가볍게 정리하는 가성비 카테고리",
    description:
      "비교적 낮은 예산으로도 변화를 체감하기 쉬운 기본 시술군입니다. 입문용으로도 많이 선택됩니다.",
    examples: "이마 보톡스, 턱보톡스, 사각턱, 윤곽 보톡스",
    audience: "짧은 다운타임으로 표정 주름과 라인을 정리하고 싶은 경우",
    accent: "amber",
    concernTags: ["주름/노화"],
  },
  {
    name: "관리",
    headline: "피부 컨디션과 진정을 중심으로 가볍게 다듬는 유지형 카테고리",
    description:
      "LDM, 진정관리, 수분관리처럼 회복 부담이 적고 주기적으로 받을 수 있는 관리형 시술입니다.",
    examples: "LDM, 진정관리, 수분관리, 재생관리",
    audience: "다운타임이 적은 입문형 시술이나 유지 관리를 원하는 경우",
    accent: "emerald",
    concernTags: ["피부결/모공", "잡티/색소", "여드름/흉터"],
  },
  {
    name: "모공흉터",
    headline: "모공과 흉터처럼 질감 개선이 중요한 고민을 다루는 카테고리",
    description:
      "프락셀, 포텐자, 서브시전 계열처럼 회복과 효과를 함께 고려해야 하는 시술이 포함됩니다.",
    examples: "프락셀, 포텐자, 서브시전, 레이저 재생",
    audience: "패인 흉터, 넓은 모공, 피부결 불균형이 핵심 고민인 경우",
    accent: "violet",
    concernTags: ["여드름/흉터", "피부결/모공"],
  },
  {
    name: "제모",
    headline: "반복 관리 비용을 줄이는 실용형 시술 카테고리",
    description:
      "부위별 반복 시술이 필요한 만큼 가격과 병원 접근성, 횟수 정책을 함께 비교해야 하는 영역입니다.",
    examples: "겨드랑이 제모, 인중 제모, 바디 제모",
    audience: "가격 효율과 장기적인 유지 비용을 함께 보고 싶은 경우",
    accent: "slate",
    concernTags: [],
  },
];

export function getCategoryMeta(name: string) {
  return (
    treatmentCategories.find((category) => category.name === name) ?? {
      name,
      headline: "시술 정보를 비교하고 나에게 맞는 선택지를 정리해보세요.",
      description:
        "가격 범위, 회복 정보, 주의사항을 먼저 보고 불필요한 시술을 걸러내는 것이 중요합니다.",
      examples: "관련 시술 데이터 확인",
      audience: "팩트 기반 비교가 필요한 모든 사용자",
      accent: "slate" as AccentName,
      concernTags: [],
    }
  );
}
