/** 상단 메뉴·전체 메뉴·하단 탭이 함께 쓰는 메뉴 목록. 메뉴를 바꿀 때는 여기만 고치면 됩니다. */
export type MenuLink = { href: string; label: string };
export type TabIcon = "home" | "clinic" | "verified" | "price" | "ai" | "globe";
export type TabLink = MenuLink & { icon: TabIcon; match: string };

/** PC 상단 메뉴 */
export const desktopLinks: Record<"ko" | "global", MenuLink[]> = {
  ko: [
    { href: "/clinics?category=skin", label: "피부" },
    { href: "/clinics?category=surgery", label: "성형" },
    { href: "/clinics?category=dental", label: "치과" },
    { href: "/verified", label: "검증 병원" },
    { href: "/prices", label: "시술 가격" },
    { href: "/global", label: "외국인 안내" },
    { href: "/ai", label: "AI 상담" },
  ],
  global: [
    { href: "/global", label: "Global guide" },
    { href: "/clinics", label: "Recommended clinics" },
    { href: "/prices", label: "Prices" },
    { href: "/ai#translate", label: "AI interpreter" },
  ],
};

/** 휴대폰 하단 탭 (5개) */
export const tabLinks: Record<"ko" | "global", TabLink[]> = {
  ko: [
    { href: "/", label: "홈", icon: "home", match: "/" },
    { href: "/clinics", label: "추천 병원", icon: "clinic", match: "/clinics" },
    { href: "/verified", label: "검증 병원", icon: "verified", match: "/verified" },
    { href: "/prices", label: "가격", icon: "price", match: "/prices" },
    { href: "/ai", label: "AI 상담", icon: "ai", match: "/ai" },
  ],
  global: [
    { href: "/", label: "Home", icon: "home", match: "/" },
    { href: "/global", label: "Guide", icon: "globe", match: "/global" },
    { href: "/clinics", label: "Clinics", icon: "clinic", match: "/clinics" },
    { href: "/prices", label: "Prices", icon: "price", match: "/prices" },
    { href: "/ai", label: "AI", icon: "ai", match: "/ai" },
  ],
};

/** 휴대폰 전체 메뉴 (☰) */
export const menuGroups: Record<"ko" | "global", { title: string; links: MenuLink[] }[]> = {
  ko: [
    { title: "병원 찾기", links: [
      { href: "/clinics?category=skin", label: "피부" },
      { href: "/clinics?category=surgery", label: "성형" },
      { href: "/clinics?category=dental", label: "치과" },
      { href: "/verified", label: "검증 병원" },
    ] },
    { title: "알아보기", links: [
      { href: "/prices", label: "시술 가격" },
      { href: "/guide/breast", label: "가슴성형 가이드" },
      { href: "/booking", label: "상담 준비" },
      { href: "/global", label: "외국인 안내" },
    ] },
    { title: "탱글 AI", links: [
      { href: "/ai", label: "AI 상담" },
      { href: "/ai#questions", label: "상담 질문지" },
      { href: "/ai#review", label: "가짜 후기 필터" },
      { href: "/ai#translate", label: "병원 번역" },
    ] },
    { title: "원장님", links: [{ href: "/verified/apply", label: "검증 병원 신청" }] },
  ],
  global: [
    { title: "For international patients", links: [
      { href: "/global", label: "Global guide" },
      { href: "/ai#translate", label: "AI clinic interpreter" },
    ] },
    { title: "Find", links: [
      { href: "/clinics", label: "Recommended clinics" },
      { href: "/prices", label: "Prices" },
      { href: "/ai", label: "Ask Tangle AI" },
    ] },
  ],
};

/** 현재 주소가 탭에 해당하는지 */
export function isActive(pathname: string, match: string) {
  return match === "/" ? pathname === "/" : pathname === match || pathname.startsWith(`${match}/`);
}
