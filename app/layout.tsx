import type { Metadata, Viewport } from "next";
import "./globals.css";
import ChatBot from "./components/ChatBot";
import BottomTabs from "./components/하단탭";
import LanguageProvider from "./components/LanguageProvider";
import Link from "next/link";
import TangleLogo from "./components/탱글로고";
import TangleXDrAidee from "./components/탱글x닥터에이디";
import FooterPartnerStrip from "./components/푸터파트너띠";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f8f5f0" };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle.kr"),
  title: {
    default: "탱글 | 광고 없는 추천 병원과 시술 가격",
    template: "%s | Tangle",
  },
  description:
    "내돈내산 경험으로 고른 피부·성형·치과 병원 화이트리스트와 서울 병원의 규격별 공개 시술 가격을 비교하세요.",
  openGraph: {
    type: "website",
    siteName: "탱글 tangle",
    title: "탱글 | 광고 없는 추천 병원과 시술 가격",
    description: "내돈내산 경험으로 고른 병원 화이트리스트와 서울 병원의 규격별 공개 시술 가격.",
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <footer className="shell pb-28 pt-8 text-sm text-[var(--color-muted)]">
            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[var(--color-silver-mist)] pt-6">
              <TangleLogo size="sm" />
              <nav aria-label="서비스 바로가기" className="flex flex-wrap gap-x-5 gap-y-3">
                <Link href="/clinics?category=skin">피부</Link>
                <Link href="/clinics?category=surgery">성형</Link>
                <Link href="/clinics?category=dental">치과</Link>
                <Link href="/verified">검증 병원</Link>
                <Link href="/prices">시술 가격</Link>
                <Link href="/ai">탱글 AI</Link>
                <Link href="/global">Global patients</Link>
                <Link href="/recommend">조건별 추천</Link>
                <Link href="/request">견적 요청</Link>
                <Link href="/booking">상담 준비</Link>
                <Link href="/hospital">병원 센터</Link>
                <Link href="/my">내 요청</Link>
              </nav>
            </div>
            <FooterPartnerStrip><TangleXDrAidee variant="strip" placement="footer" /></FooterPartnerStrip>
            <p className="mt-4 max-w-3xl text-xs leading-6">경험 추천과 참고 가격은 상담 준비를 위한 정보입니다. 개인별 시술 적합성·비용·현재 진료 여부는 의료기관에 확인해 주세요.</p>
            <p className="mt-2 text-xs"><Link href="/privacy" className="font-semibold text-[var(--color-carbon)] underline underline-offset-4">개인정보처리방침</Link></p>
          </footer>
          <ChatBot />
          <BottomTabs />
        </LanguageProvider>
      </body>
    </html>
  );
}
