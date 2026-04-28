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
    <div className="pb-10 pt-4 sm:pt-5">
      <div className="shell">
        <nav className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-[13px] font-semibold text-stone-500 hover:text-stone-900"
          >
            ← 뒤로가기
          </button>
        </nav>

        <main className="space-y-4">
          <section className="panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent.chip}`}>
                  {categoryName}
                </span>
                <h1 className="balance mt-4 text-[2rem] font-semibold leading-[1.04] text-stone-950 sm:text-[2.4rem]" data-display="true">
                  {categoryMeta.headline}
                </h1>
                <p className="mt-4 max-w-3xl text-[14px] leading-7 text-stone-600">{categoryMeta.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className={`rounded-[20px] border ${accent.border} ${accent.surface} px-4 py-4`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    대표 시술
                  </p>
                  <p className="mt-2 text-[14px] font-semibold leading-6 text-stone-900">
                    {categoryMeta.examples}
                  </p>
                </div>
                <div className="rounded-[20px] border border-stone-200 bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    추천 대상
                  </p>
                  <p className="mt-2 text-[14px] font-semibold leading-6 text-stone-900">
                    {categoryMeta.audience}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel px-5 py-5 sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-3">category inventory</p>
                <h2 className="type-section" data-display="true">
                  이 카테고리에서 바로 비교할 수 있는 시술
                </h2>
              </div>
              <span className="text-[12px] text-stone-400">
                가격, 회복, 시너지를 한 카드 안에서 확인합니다.
              </span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-stone-500">시술 목록을 불러오는 중입니다.</div>
            ) : list.length === 0 ? (
              <div className="py-10 text-center text-sm text-stone-500">아직 등록된 시술이 없습니다.</div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {list.map((item) => (
                  <Link
                    href={`/treatment/${item.id}`}
                    key={item.id}
                    className="soft-panel flex h-full flex-col justify-between p-5 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-[1.15rem] font-semibold text-stone-950">{item.name}</h3>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-600">
                          통증 {item.pain_level}/5
                        </span>
                      </div>
                      <p className="mt-3 text-[13px] leading-7 text-stone-600">{item.description}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          가격대
                        </p>
                        <p className="mt-2 text-[13px] font-semibold text-stone-800">
                          {item.price_min}~{item.price_max}만원
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          시너지
                        </p>
                        <p className="mt-2 text-[13px] font-semibold leading-6 text-stone-800">
                          {item.synergy || "단독 진행 가능"}
                        </p>
                      </div>
                      <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          회복
                        </p>
                        <p className="mt-2 text-[13px] font-semibold leading-6 text-stone-800">
                          {item.recovery || "상담 후 확인"}
                        </p>
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
