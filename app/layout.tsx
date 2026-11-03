import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "./components/ChatBot";
import LanguageDock from "./components/LanguageDock";
import LanguageProvider from "./components/LanguageProvider";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle.kr"),
  title: {
    default: "탱글 | 서울 병원 경험 추천과 시술 가격 비교",
    template: "%s | Tangle",
  },
  description:
    "서울 시술별 병원·원장 경험 추천, 규격별 참고 가격, 조건별 시술 후보를 한곳에서 비교하고 상담을 준비하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          <LanguageDock />
          {children}
          <footer className="shell pb-28 pt-8 text-sm text-[var(--color-muted)]">
            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[var(--color-silver-mist)] pt-6">
              <Link href="/" className="text-xl font-bold text-[var(--color-carbon)]">탱글 <span className="text-xs font-medium">Tangle</span></Link>
              <nav aria-label="서비스 바로가기" className="flex flex-wrap gap-x-5 gap-y-3">
                <Link href="/clinics">서울 경험 추천</Link>
                <Link href="/prices">시술 가격표</Link>
                <Link href="/recommend">조건별 추천</Link>
                <Link href="/my">내 요청</Link>
              </nav>
            </div>
            <p className="mt-4 max-w-3xl text-xs leading-6">경험 추천과 참고 가격은 상담 준비를 위한 정보입니다. 개인별 시술 적합성·비용·현재 진료 여부는 의료기관에 확인해 주세요.</p>
          </footer>
          <ChatBot />
        </LanguageProvider>
      </body>
    </html>
  );
}
