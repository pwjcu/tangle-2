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
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-warm-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
  sky: {
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
  amber: {
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-warm-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
  emerald: {
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
  violet: {
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-warm-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
  slate: {
    chip: "border border-[var(--color-carbon)] bg-transparent text-[var(--color-carbon)]",
    surface: "bg-[var(--color-paper)]",
    border: "border-[var(--color-carbon)]",
    text: "text-[var(--color-carbon)]",
  },
};

export const treatmentCategories: CategoryMeta[] = [
  {
    name: "리프팅",
    headline: "처짐, 탄력, 얼굴선 변화를 한 번에 판단해야 하는 핵심 카테고리",
    description:
      "HIFU, RF, 고주파, 실리프팅까지 장비와 방식이 많아 가격만으로 고르기 어렵습니다. 탱글은 예산, 회복 가능 시간, 원하는 변화 강도를 기준으로 후보를 좁힙니다.",
    examples: "울쎄라, 써마지, 볼뉴머, 덴서티, 세르프, 리프테라2, 올리지오, 온다리프팅",
    audience: "턱선, 볼처짐, 잔주름, 얼굴 탄력 저하가 고민인 사용자",
    accent: "rose",
    concernTags: ["탄력/리프팅", "주름/노화"],
  },
  {
    name: "스킨부스터",
    headline: "피부결, 보습, 잔주름을 자연스럽게 개선하고 싶은 사용자를 위한 카테고리",
    description:
      "리쥬란, 쥬베룩, 물광주사, 프로파일로처럼 피부 컨디션을 끌어올리는 시술군입니다. 통증, 멍, 반복 주기까지 함께 봐야 만족도가 높습니다.",
    examples: "리쥬란, 쥬베룩, 리투오, 프로파일로, 쥬브아셀, 물광주사, 힐로웨이브",
    audience: "과한 변화보다 자연스러운 피부 컨디션 개선을 원하는 사용자",
    accent: "sky",
    concernTags: ["피부결/모공", "탄력/리프팅", "회복관리"],
  },
  {
    name: "보톡스",
    headline: "짧은 시간 안에 특정 라인과 근육 고민을 정리하는 입문 카테고리",
    description:
      "이마, 미간, 턱, 승모근처럼 부위별 목적이 분명합니다. 단순 최저가보다 용량, 부위, 내성 관리, 병원 설명력을 함께 보는 것이 중요합니다.",
    examples: "이마 보톡스, 턱 보톡스, 스킨보톡스, 승모근 보톡스",
    audience: "가벼운 주름, 근육 라인, 첫 시술 입문을 고려하는 사용자",
    accent: "amber",
    concernTags: ["주름/노화"],
  },
  {
    name: "관리",
    headline: "피부 컨디션 유지, 회복 보조, 항노화 루틴을 묶는 운영형 카테고리",
    description:
      "LDM, PDT, 여드름 스케일링, 수액, 고압산소치료처럼 반복 관리와 회복 보조에 가까운 항목입니다. 시술 전후 컨디션 관리까지 확장할 수 있습니다.",
    examples: "LDM, PDT, 여드름 스케일링, 수액, 크라이오, 고압산소치료",
    audience: "다운타임이 적은 관리, 피부 회복, 항노화 루틴을 원하는 사용자",
    accent: "emerald",
    concernTags: ["피부결/모공", "여드름/흉터", "회복관리", "항노화"],
  },
  {
    name: "색소/레이저",
    headline: "기미, 잡티, 홍조, 문신처럼 장비 선택과 횟수 판단이 중요한 카테고리",
    description:
      "레이저는 이름보다 파장, 적응증, 회복, 반복 횟수가 중요합니다. 최신 장비와 고전 장비를 구분해 사용자가 불필요한 선택을 줄일 수 있게 돕습니다.",
    examples: "피코토닝, 레이저토닝, 혈관레이저, 루비레이저, 울트라클리어, 엔디야그",
    audience: "잡티, 색소, 홍조, 문신 제거, 피부톤 개선을 비교하려는 사용자",
    accent: "amber",
    concernTags: ["잡티/색소", "붉음증/민감"],
  },
  {
    name: "모공흉터",
    headline: "모공, 흉터, 피부결처럼 질감 변화를 오래 보고 접근해야 하는 카테고리",
    description:
      "포텐자, 모피어스8, 울트라펄스, 아그네스처럼 회복과 통증 편차가 큰 시술이 많습니다. 단발 가격보다 회차와 조합 계획을 함께 봐야 합니다.",
    examples: "포텐자, 모피어스8, 울트라펄스, 아그네스, 골드PTT",
    audience: "여드름 흉터, 넓은 모공, 거친 피부결이 고민인 사용자",
    accent: "violet",
    concernTags: ["여드름/흉터", "피부결/모공"],
  },
  {
    name: "바디라인",
    headline: "얼굴 밖의 체형, 윤곽, 라인 고민을 별도로 비교하는 확장 카테고리",
    description:
      "튠라이너, 지방분해주사, 고주파 바디 관리처럼 부위와 회차에 따라 가격 차이가 큽니다. 병원 제안형 모델과 특히 잘 맞는 영역입니다.",
    examples: "튠라이너, 지방분해주사, 바디 고주파, 윤곽주사",
    audience: "복부, 팔, 허벅지, 이중턱 등 라인 고민이 있는 사용자",
    accent: "emerald",
    concernTags: ["바디라인", "이중턱", "유지관리"],
  },
  {
    name: "제모",
    headline: "반복 비용과 부위별 패키지 구성이 중요한 실용 카테고리",
    description:
      "레이저 제모는 장비, 부위, 회차, 성별에 따라 견적 차이가 큽니다. 탱글은 반복 방문이 필요한 항목을 패키지 관점으로 비교할 수 있게 만듭니다.",
    examples: "젠틀맥스프로플러스, 클라리티, 아포지엘리트, 소프라노, 남성 수염 제모",
    audience: "부위별 제모 비용, 회차, 장비 차이를 비교하고 싶은 사용자",
    accent: "slate",
    concernTags: ["제모", "유지관리"],
  },
];

export function displayCategoryName(name: string) {
  return name === "모공흉터" ? "모공/흉터" : name;
}

export function normalizeCategoryName(name: string) {
  return name === "모공/흉터" ? "모공흉터" : name;
}

export function getCategoryMeta(name: string) {
  const normalizedName = normalizeCategoryName(name);
  const category = treatmentCategories.find((category) => category.name === normalizedName);

  if (category) {
    return {
      ...category,
      name: displayCategoryName(category.name),
    };
  }

  return (
    {
      name,
      headline: "시술 정보를 비교하고 내 고민에 맞는 선택지를 정리해보세요.",
      description:
        "가격 범위, 회복 정보, 주의사항을 먼저 확인하면 과한 시술이나 불필요한 비용을 줄일 수 있습니다.",
      examples: "관련 시술 데이터 확인",
      audience: "팩트 기반 비교가 필요한 사용자",
      accent: "slate" as AccentName,
      concernTags: [],
    }
  );
}
