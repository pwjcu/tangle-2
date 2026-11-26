"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { desktopLinks, menuGroups } from "./메뉴";
import TangleLogo from "./탱글로고";

/** 모든 화면 공통 상단. PC는 메뉴를 펼쳐 보여 주고, 휴대폰은 ☰ 버튼으로 전체 메뉴를 엽니다. */
export default function SiteHeader({ right }: { right?: React.ReactNode }) {
  const { language } = useLanguage();
  const key = language === "ko" ? "ko" : "global";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // 헤더에 backdrop-blur가 있어 메뉴 시트는 헤더 밖(형제)에 그립니다. 다른 화면으로 이동하면 메뉴를 닫습니다.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const toggle = () => { setOpenedAt(pathname); setOpen(!open); };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[var(--color-silver-mist)] bg-[var(--cream)]/95 backdrop-blur-sm">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <TangleLogo />
        <nav aria-label="주 메뉴" className="hidden items-center gap-1 md:flex">
          {desktopLinks[key].map((link) => <Link key={link.href} href={link.href} className="ghost-link">{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compactLight />
          {right}
          <button type="button" onClick={toggle} aria-expanded={open} aria-controls="site-menu" aria-label={open ? (key === "ko" ? "메뉴 닫기" : "Close menu") : (key === "ko" ? "전체 메뉴" : "Menu")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-silver-mist)] bg-white text-[var(--color-carbon)] md:hidden">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
            </svg>
          </button>
        </div>
      </div>
    </header>

      {open && (
        <div id="site-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-[var(--cream)] md:hidden">
          <nav aria-label={key === "ko" ? "전체 메뉴" : "All menu"} className="shell grid gap-8 pb-28 pt-6">
            {menuGroups[key].map((group) => (
              <section key={group.title}>
                <h2 className="text-[12px] font-bold tracking-[0.08em] text-[var(--accent)]">{group.title}</h2>
                <ul className="mt-2 divide-y divide-[var(--color-silver-mist)] border-y border-[var(--color-silver-mist)]">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 text-[17px] font-semibold text-[var(--color-carbon)]">
                        {link.label}<span aria-hidden="true" className="text-[var(--color-muted)]">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <Link href="/privacy" onClick={() => setOpen(false)} className="text-[13px] text-[var(--color-muted)] underline underline-offset-4">{key === "ko" ? "개인정보처리방침" : "Privacy policy"}</Link>
          </nav>
        </div>
      )}
    </>
  );
}
