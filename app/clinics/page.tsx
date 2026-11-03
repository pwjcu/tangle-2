import type { Metadata } from "next";
import { Suspense } from "react";
import 서울경험추천목록 from "./서울경험추천목록";

export const metadata: Metadata = {
  title: "서울 경험 추천 — 시술별 병원·의료진 참고 목록",
  description: "사용자가 공유한 서울 시술별 개인 경험 25개 항목. 병원·의료진·시술명으로 검색하고, 원문과 확인이 필요한 정보를 함께 살펴보세요.",
  alternates: { canonical: "/clinics" },
};

export default function ClinicsPage() {
  return (
    <Suspense fallback={<main className="shell py-20" aria-busy="true"><p role="status">서울 경험 추천을 불러오고 있습니다.</p></main>}>
      <서울경험추천목록 />
    </Suspense>
  );
}
