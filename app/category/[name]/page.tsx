"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { accentStyles, getCategoryMeta } from "../../../lib/siteContent";

interface Treatment {
  id: number;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
  recovery?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(params.name as string);
  const categoryMeta = getCategoryMeta(categoryName);
  const accent = accentStyles[categoryMeta.accent];

  const [list, setList] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      const { data, error } = await supabase.from("treatments").select("*").eq("category", categoryName);

      if (error) {
        console.error(error);
      } else {
        setList(data || []);
      }
      setLoading(false);
    };

    void fetchCategory();
  }, [categoryName]);

  return (
    <div className="pb-16 pt-5 sm:pt-7">
      <div className="shell">
        <nav className="mb-6">
          <button onClick={() => router.back()} className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            ← 뒤로가기
          </button>
        </nav>

        <main className="space-y-5">
          <section className="panel px-6 py-7 sm:px-8">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${accent.chip}`}>
              {categoryName}
            </span>
            <h1 className="mt-4 text-4xl font-bold text-stone-950" data-display="true">
              {categoryMeta.headline}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">{categoryMeta.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className={`rounded-[24px] border ${accent.border} ${accent.surface} px-5 py-5`}>
                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">대표 시술</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{categoryMeta.examples}</p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white px-5 py-5">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">추천 상황</p>
                <p className="mt-2 text-base font-semibold text-stone-900">{categoryMeta.audience}</p>
              </div>
            </div>
          </section>

          <section className="panel px-6 py-7 sm:px-8">
            {loading ? (
              <div className="py-10 text-center text-sm text-stone-500">시술 목록을 불러오는 중입니다.</div>
            ) : list.length === 0 ? (
              <div className="py-10 text-center text-sm text-stone-500">아직 등록된 시술이 없습니다.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {list.map((item) => (
                  <Link
                    href={`/treatment/${item.id}`}
                    key={item.id}
                    className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-2xl font-bold text-stone-900">{item.name}</h2>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                        통증 {item.pain_level}/5
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-stone-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">가격대</p>
                        <p className="mt-2 text-sm font-semibold text-stone-800">
                          {item.price_min}~{item.price_max}만원
                        </p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">시너지</p>
                        <p className="mt-2 text-sm font-semibold text-stone-800">{item.synergy || "단독 진행 가능"}</p>
                      </div>
                      <div className="rounded-2xl bg-stone-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">회복</p>
                        <p className="mt-2 text-sm font-semibold text-stone-800">{item.recovery || "상담 시 확인"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
