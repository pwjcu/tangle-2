import type { Metadata } from "next";
import "./globals.css";
import ChatBot from "./components/ChatBot";

export const metadata: Metadata = {
  title: "Tangle | 가격만 보지 않는 뷰티 의사결정 플랫폼",
  description:
    "개인 맞춤형 시술 추천, 팩트 기반 가격대 비교, 역입찰형 병원 제안을 하나의 흐름으로 연결하는 Tangle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
