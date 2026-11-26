"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { isActive, tabLinks, type TabIcon } from "./메뉴";

const paths: Record<TabIcon, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />,
  clinic: <><path d="M5 21V8l7-4 7 4v13" /><path d="M12 10v6M9 13h6" /></>,
  verified: <><path d="M12 3 5 6v5.5c0 4.3 3 7.9 7 9.5 4-1.6 7-5.2 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  price: <><path d="M4 12.5V5a1 1 0 0 1 1-1h7.5L20 11.5 12.5 19 4 12.5Z" /><circle cx="8.5" cy="8.5" r="1.3" /></>,
  ai: <><path d="M12 3.5l1.7 4.6 4.8 1.7-4.8 1.7L12 16.1l-1.7-4.6-4.8-1.7 4.8-1.7L12 3.5Z" /><path d="M18 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" /></>,
};

/** 휴대폰 화면 하단에 고정되는 탭바. PC(768px 이상)에서는 보이지 않습니다. */
export default function BottomTabs() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const tabs = tabLinks[language === "ko" ? "ko" : "global"];
  return (
    <nav aria-label={language === "ko" ? "하단 메뉴" : "Bottom menu"}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-silver-mist)] bg-[var(--cream)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden print:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.match);
          return (
            <li key={tab.href}>
              <Link href={tab.href} aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-[var(--brand)]" : "text-[#8a948d]"}`}>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">{paths[tab.icon]}</svg>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
