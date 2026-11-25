"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import TangleLogo from "./탱글로고";

const koLinks = [
  { href: "/clinics?category=skin", label: "피부" },
  { href: "/clinics?category=surgery", label: "성형" },
  { href: "/clinics?category=dental", label: "치과" },
  { href: "/verified", label: "검증 병원" },
  { href: "/prices", label: "시술 가격" },
  { href: "/global", label: "외국인 안내" },
  { href: "/ai", label: "AI 상담" },
];
const globalLinks = [
  { href: "/global", label: "nav.global" },
  { href: "/clinics", label: "Recommended clinics" },
  { href: "/prices", label: "nav.prices" },
  { href: "/ai#translate", label: "AI" },
];

/** 모든 화면 공통 상단. 오른쪽 끝에 로그인 버튼 등을 넣을 수 있습니다. */
export default function SiteHeader({ right }: { right?: React.ReactNode }) {
  const { language, t } = useLanguage();
  const links = language === "ko" ? koLinks : globalLinks.map((link) => ({ ...link, label: link.label.startsWith("nav.") ? t(link.label) : link.label }));
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-silver-mist)] bg-[var(--cream)]/95 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <TangleLogo />
        <nav aria-label="주 메뉴" className="hidden items-center gap-1 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className="ghost-link">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compactLight />
          {right}
        </div>
      </div>
      <nav aria-label="주 메뉴" className="shell -mt-1 flex gap-1 overflow-x-auto pb-2 md:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} className="ghost-link shrink-0">{link.label}</Link>)}
      </nav>
    </header>
  );
}
