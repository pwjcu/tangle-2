"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

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

function formatPrice(min: number, max: number) {
  return `${min.toLocaleString()}~${max.toLocaleString()}만원`;
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
    return <div className="flex min-h-screen items-center justify-center text-[var(--color-muted)]">불러오는 중입니다.</div>;
  }

  if (!treatment) {
    return <div className="p-10 text-center text-[var(--color-muted)]">데이터가 없습니다.</div>;
  }

  const requestHref = `/request?${new URLSearchParams({
    category: treatment.category,
    budget: String(Math.round((treatment.price_min + treatment.price_max) / 2)),
    symptom: `${treatment.name}에 관심이 있습니다. ${treatment.description}`,
  }).toString()}`;

  return (
    <div className="pb-10">
      <header className="border-b border-[var(--color-carbon)]">
        <div className="shell flex min-h-[64px] items-center justify-between py-3">
          <button onClick={() => router.back()} className="ghost-link">
            Back
          </button>
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
        </div>
      </header>

      <main className="shell">
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">{treatment.category}</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              {treatment.name}
            </h1>
            <p className="mt-7 max-w-[760px] text-[16px] leading-8 text-[var(--color-muted)]">
              {treatment.description}
            </p>
          </div>

          <aside className="grid sm:grid-cols-2">
            <InfoBlock label="price range" value={formatPrice(treatment.price_min, treatment.price_max)} />
            <InfoBlock label="pain level" value={`${treatment.pain_level}/5`} />
            <InfoBlock label="cycle" value={treatment.cycle || "상담 후 확인"} />
            <InfoBlock label="recovery" value={treatment.recovery || "상담 후 확인"} />
          </aside>
        </section>

        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">decision support</p>
            <h2 className="type-section mt-6" data-display="true">
              이 시술에서 먼저
              <br />
              확인해야 할 기준
            </h2>
          </div>

          <div className="grid md:grid-cols-3">
            <InfoBlock label="side effects" value={treatment.side_effects || "상담 후 확인"} />
            <InfoBlock label="synergy" value={treatment.synergy || "단독 진행 가능"} />
            <article className="flex min-h-[240px] flex-col justify-between border-b border-[var(--color-line)] p-5 md:border-r md:last:border-r-0 sm:p-7">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">next step</p>
                <p className="mt-8 text-[1.4rem] font-normal leading-tight" data-display="true">
                  조건에 맞는 병원 제안을 받아보세요.
                </p>
              </div>
              <Link href={requestHref} className="action-primary mt-8 w-full">
                견적 요청
              </Link>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-h-[220px] border-b border-[var(--color-line)] p-5 sm:p-7 sm:border-r sm:even:border-r-0">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{label}</p>
      <p className="mt-8 text-[1.45rem] font-normal leading-8" data-display="true">
        {value}
      </p>
    </article>
  );
}
