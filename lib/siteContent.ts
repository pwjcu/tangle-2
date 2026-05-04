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
    headline: "탄력과 윤곽을 빠르게 체감하고 싶을 때 먼저 보는 메인 카테고리",
    description:
      "울쎄라, 써마지처럼 얼굴선과 처짐 개선에 초점을 둔 시술을 모았습니다. 예산이 높아질수록 조합 선택지도 넓어집니다.",
    examples: "울쎄라, 써마지, 티타늄 리프팅",
    audience: "처짐, 얼굴선 변화, 전반적인 탄력 저하가 가장 큰 고민인 경우",
    accent: "rose",
    concernTags: ["탄력/리프팅", "주름/노화"],
  },
  {
    name: "스킨부스터",
    headline: "피부결과 보습, 자연스러운 윤광 인상을 끌어올리는 카테고리",
    description:
      "리쥬란, 물광주사, 쥬베룩 같은 스킨부스터 계열 시술입니다. 피부 컨디션을 전반적으로 정리하고 싶은 사람에게 잘 맞습니다.",
    examples: "리쥬란, 쥬베룩, 물광주사",
    audience: "자연스럽게 피부결과 보습감을 끌어올리고 싶은 경우",
    accent: "sky",
    concernTags: ["피부결·모공", "톤업/색소"],
  },
  {
    name: "보톡스",
    headline: "잔주름이나 특정 라인을 가볍게 정리하는 가성비 중심 카테고리",
    description:
      "짧은 시술 시간과 비교적 합리적인 비용이 장점입니다. 처음 시술을 경험하는 사용자에게도 접근성이 좋습니다.",
    examples: "이마 보톡스, 턱 보톡스, 승모근 보톡스",
    audience: "빠른 변화보다 잔주름이나 라인을 깔끔하게 정리하고 싶은 경우",
    accent: "amber",
    concernTags: ["주름/노화"],
  },
  {
    name: "관리",
    headline: "피부 컨디션 유지와 회복 보조, 항노화 케어를 함께 담는 확장형 카테고리",
    description:
      "LDM, 진정관리, 홍조관리처럼 주기적으로 받을 수 있는 관리형 시술뿐 아니라 수액류, 크라이오, 고압산소치료 같은 회복·항노화 보조 케어도 함께 담는 카테고리입니다.",
    examples: "LDM, 진정관리, 수액류, 크라이오, 고압산소치료",
    audience: "다운타임이 적은 입문형 시술, 꾸준한 유지 관리, 회복 보조나 항노화 케어를 함께 원하는 경우",
    accent: "emerald",
    concernTags: ["피부결·모공", "톤업/색소", "붉음증/민감", "항노화", "회복관리"],
  },
  {
    name: "모공흉터",
    headline: "모공과 흉터처럼 질감 개선이 핵심인 고민을 다루는 카테고리",
    description:
      "프락셀, 서브시전, 포텐자 같은 시술을 포함합니다. 회복과 효과를 함께 고려해야 해서 상담 기반 비교가 특히 중요합니다.",
    examples: "프락셀, 포텐자, 서브시전",
    audience: "여드름 흉터, 넓은 모공, 피부결 거칠음이 핵심 고민인 경우",
    accent: "violet",
    concernTags: ["여드름·흉터", "피부결·모공"],
  },
  {
    name: "제모",
    headline: "반복 관리 비용을 줄이고 싶은 사용자를 위한 실용 카테고리",
    description:
      "시술 횟수가 누적되는 만큼 가격과 병원별 패키지 구성이 중요한 영역입니다. 부위별로 장기 비용을 비교해보는 것이 좋습니다.",
    examples: "겨드랑이 제모, 인중 제모, 바디 제모",
    audience: "가격 효율과 꾸준한 유지 비용을 함께 비교하고 싶은 경우",
    accent: "slate",
    concernTags: ["제모", "유지관리"],
  },
];

export function getCategoryMeta(name: string) {
  return (
    treatmentCategories.find((category) => category.name === name) ?? {
      name,
      headline: "시술 정보를 비교하고 내 고민에 맞는 선택지를 정리해보세요.",
      description:
        "가격 범위, 회복 정보, 주의사항을 먼저 확인하면 과한 시술이나 불필요한 비용을 더 쉽게 걸러낼 수 있습니다.",
      examples: "관련 시술 데이터 확인",
      audience: "팩트 기반 비교가 필요한 모든 사용자",
      accent: "slate" as AccentName,
      concernTags: [],
    }
  );
}
