import type { Metadata } from "next";
import VerifiedApplyForm from "./신청서";

export const metadata: Metadata = {
  title: "원장님 검증 신청 — 탱글 검증 병원",
  description: "자격과 이력을 서류로 확인받고 탱글 검증 병원에 올라가세요. 검증은 무료이며 광고비로 살 수 없습니다.",
  alternates: { canonical: "/verified/apply" },
  robots: { index: false },
};

export default function VerifiedApplyPage() {
  return <VerifiedApplyForm kakaoUrl={process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || null} />;
}
