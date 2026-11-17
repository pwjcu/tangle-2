import type { Metadata } from "next";
import { Suspense } from "react";
import 서울경험추천목록 from "./서울경험추천목록";

export const metadata: Metadata = {
  title: "검증된 추천 병원 — 피부·성형·치과",
  description: "광고 없이, 검증된 경험 후기와 직접 다녀 본 곳을 바탕으로 필터링한 피부·성형·치과 추천 병원. 체험단·가짜 후기는 뺐습니다. 병원·원장·시술명으로 검색해 보세요.",
  alternates: { canonical: "/clinics" },
};

export default function ClinicsPage() {
  return (
    <Suspense fallback={<main className="shell py-20" aria-busy="true"><p role="status">추천 병원을 불러오고 있습니다.</p></main>}>
      <서울경험추천목록 />
    </Suspense>
  );
}
