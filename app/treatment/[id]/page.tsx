"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { accentStyles, getCategoryMeta } from "../../../lib/siteContent";

interface TreatmentDetail {
  id: number;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
  side_effects: string;
  recovery: string;
  cycle: string;
}

export default function TreatmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [treatment, setTreatment] = useState<TreatmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      const { data, error } = await supabase.from("treatments").select("*").eq("id", id).single();

      if (error) {
        console.error(error);
        alert("시술 정보를 불러오지 못했습니다.");
        router.push("/recommend");
      } else {
        setTreatment(data);
      }
      setLoading(false);
    };

    void fetchDetail();
  }, [id, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-stone-500">불러오는 중입니다.</div>;
  }
  if (!treatment) return <div>데이터가 없습니다.</div>;

  const accent = accentStyles[getCategoryMeta(treatment.category).accent];
  const requestHref = `/request?${new URLSearchParams({
    category: treatment.category,
    budget: String(Math.round((treatment.price_min + treatment.price_max) / 2)),
    symptom: `${treatment.name}에 관심이 있습니다. ${treatment.description}`,
  }).toString()}`;

  return (
    <div className="pb-16 pt-5 sm:pt-7">
      <div className="shell">
        <nav className="mb-6 flex items-center">
          <button onClick={() => router.back()} className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            ← 뒤로가기
          </button>
        </nav>

        <main className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="panel px-6 py-7 sm:px-8">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${accent.chip}`}>
              {treatment.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold text-stone-950" data-display="true">
              {treatment.name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">{treatment.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-5">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">가격 범위</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">
                  {treatment.price_min}~{treatment.price_max}만원
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-5">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">통증 부담</p>
                <div className="mt-3 flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-3 w-8 rounded-full ${
                        index < treatment.pain_level ? "bg-stone-900" : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <InfoCard title="권장 주기" value={treatment.cycle || "상담 시 확인 필요"} />
              <InfoCard title="회복 기간" value={treatment.recovery || "상담 시 확인 필요"} />
              <InfoCard title="주요 부작용" value={treatment.side_effects || "상담 시 확인 필요"} />
              <InfoCard title="시너지 시술" value={treatment.synergy || "단독 진행 가능"} />
            </div>
          </section>

          <aside className="space-y-5">
            <section className="panel px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">decision support</p>
              <h2 className="mt-3 text-2xl font-bold text-stone-950" data-display="true">
                이 시술을 볼 때 같이 확인할 것
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                <li>예산 범위 안에서 단독으로 갈지, 조합으로 갈지</li>
                <li>회복 기간이 내 일정에 맞는지</li>
                <li>같이 들어가면 좋은 보조 시술이 있는지</li>
              </ul>
            </section>

            <Link
              href={requestHref}
              className="block rounded-[28px] bg-stone-900 px-6 py-6 text-white shadow-[0_18px_45px_rgba(20,16,14,0.22)] hover:-translate-y-0.5 hover:bg-stone-800"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">next step</p>
              <h3 className="mt-3 text-2xl font-bold" data-display="true">
                이 시술을 기준으로 견적 요청하기
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/75">
                관심 시술과 예산을 요청서에 미리 넣어 바로 병원 제안 비교 단계로 이동합니다.
              </p>
            </Link>
          </aside>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-5">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-400">{title}</p>
      <p className="mt-2 text-sm font-medium leading-7 text-stone-700">{value}</p>
    </div>
  );
}
