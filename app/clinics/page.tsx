import type { Metadata } from "next";
import { Suspense } from "react";
import 서울경험추천목록 from "./서울경험추천목록";

export const metadata: Metadata = {
  title: "서울 경험 추천 — 시술별 병원·의료진 참고 목록",
  description: "탱글 운영진이 직접 받은 수술·시술 경험과 공유받은 병원·원장 정보를 피부·성형으로 정리했습니다. 병원·의료진·시술명으로 검색해 보세요.",
  alternates: { canonical: "/clinics" },
};

export default function ClinicsPage() {
  return (
    <Suspense fallback={<main className="shell py-20" aria-busy="true"><p role="status">서울 경험 추천을 불러오고 있습니다.</p></main>}>
      <서울경험추천목록 />
    </Suspense>
  );
}
