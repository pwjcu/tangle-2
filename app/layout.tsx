import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatBot from "./components/ChatBot"; // ★ 채팅봇 가져오기

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tangle - 나만의 미용 에이전트",
  description: "AI 기반 맞춤형 시술 추천 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <ChatBot /> {/* ★ 여기에 챗봇 배치! */}
      </body>
    </html>
  );
}