import type { Metadata } from "next";
import AITools from "./AI도구";

export const metadata: Metadata = {
  title: "탱글 AI — 상담 도우미·상담 질문지·가짜 후기 필터·병원 번역",
  description:
    "탱글 AI가 검증된 추천 병원과 시술 가격 데이터로 답합니다. 내 상황에 맞는 상담 질문지, 체험단·광고 후기 판별, 외국인 환자를 위한 병원 번역까지.",
  alternates: { canonical: "/ai" },
};

export default function AIPage() {
  return <AITools />;
}
