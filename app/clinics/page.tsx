import type { Metadata } from "next";
import { Suspense } from "react";
import 서울경험추천목록 from "./서울경험추천목록";

export const metadata: Metadata = {
  title: "추천 병원 화이트리스트 — 피부·성형·치과",
  description: "내돈내산 경험으로 고른 피부·성형·치과 병원 화이트리스트. 직접 받은 경험과 상담에서 확인할 점을 병원·원장·시술명으로 검색해 보세요.",
  alternates: { canonical: "/clinics" },
};

export default function ClinicsPage() {
  return (
    <Suspense fallback={<main className="shell py-20" aria-busy="true"><p role="status">추천 병원을 불러오고 있습니다.</p></main>}>
      <서울경험추천목록 />
    </Suspense>
  );
}
