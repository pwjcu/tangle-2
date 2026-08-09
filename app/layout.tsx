import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "./components/ChatBot";
import LanguageDock from "./components/LanguageDock";
import LanguageProvider from "./components/LanguageProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle-2.vercel.app"),
  title: {
    default: "Tangle | 소비자와 병원을 잇는 뷰티 커넥트 플랫폼",
    template: "%s | Tangle",
  },
  description:
    "개인 맞춤형 시술 추천, 견적 요청, 역제안형 병원 연결, 글로벌 환자 유치 흐름을 하나로 연결하는 Tangle",
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
          <ChatBot />
        </LanguageProvider>
      </body>
    </html>
  );
}
