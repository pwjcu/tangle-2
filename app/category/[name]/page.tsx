"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { displayCategoryName, getCategoryMeta, normalizeCategoryName } from "../../../lib/siteContent";
import { getLocalTreatmentsByCategory } from "../../../lib/localTreatments";

interface Treatment {
  id: number | string;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
  recovery?: string;
  isLocalSeed?: true;
}

function formatPrice(min: number, max: number) {
  return `${min.toLocaleString()}~${max.toLocaleString()}만원`;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(params.name as string);
  const dataCategoryName = normalizeCategoryName(categoryName);
  const displayName = displayCategoryName(categoryName);
  const categoryMeta = getCategoryMeta(categoryName);

  const [list, setList] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      const { data, error } = await supabase.from("treatments").select("*").eq("category", dataCategoryName);

      if (error) {
        console.error(error);
      } else {
        const remoteTreatments = data || [];
        const existingNames = new Set(remoteTreatments.map((item) => item.name.replace(/\s+/g, "").toLowerCase()));
        const localTreatments = getLocalTreatmentsByCategory(dataCategoryName).filter(
          (item) => !existingNames.has(item.name.replace(/\s+/g, "").toLowerCase()),
        );

        setList([...remoteTreatments, ...localTreatments]);
      }
      setLoading(false);
    };

    void fetchCategory();
  }, [dataCategoryName]);

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
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">category inventory</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              {displayName}
            </h1>
            <p className="mt-6 max-w-[720px] text-[17px] leading-8 text-[var(--color-muted)]">
              {categoryMeta.headline}
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <article className="border-b border-[var(--color-line)] p-5 sm:border-r sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">why it matters</p>
              <p className="mt-8 text-[14px] leading-7 text-[var(--color-muted)]">{categoryMeta.description}</p>
            </article>
            <article className="border-b border-[var(--color-line)] p-5 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">typical items</p>
              <p className="mt-8 text-[1.3rem] font-normal leading-8" data-display="true">
                {categoryMeta.examples}
              </p>
            </article>
            <article className="p-5 sm:col-span-2 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">best for</p>
              <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">{categoryMeta.audience}</p>
            </article>
          </div>
        </section>

        <section className="border-x border-b border-[var(--color-carbon)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">treatment cards</p>
              <h2 className="type-section mt-5" data-display="true">
                이 카테고리에서 비교 가능한 시술
              </h2>
            </div>
            <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
              {loading ? "loading" : `${list.length} items`}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[14px] text-[var(--color-muted)]">시술 목록을 불러오는 중입니다.</div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center text-[14px] text-[var(--color-muted)]">아직 등록된 시술이 없습니다.</div>
          ) : (
            <div className="grid lg:grid-cols-2">
              {list.map((item) => {
                const requestHref = `/request?${new URLSearchParams({
                  category: item.category,
                  budget: String(Math.round((item.price_min + item.price_max) / 2)),
                  symptom: `${item.name}에 관심이 있습니다. ${item.description}`,
                }).toString()}`;

                return (
                  <Link
                    href={item.isLocalSeed ? requestHref : `/treatment/${item.id}`}
                    key={item.id}
                    className="group flex min-h-[320px] flex-col justify-between border-b border-[var(--color-line)] p-5 hover:bg-[var(--color-carbon)] hover:text-[var(--color-ghost-white)] sm:p-7 lg:border-r lg:even:border-r-0"
                  >
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <span className="border border-current px-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                          {item.isLocalSeed ? "2026 csv" : displayCategoryName(item.category)}
                        </span>
                        <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          pain {item.pain_level}/5
                        </span>
                      </div>
                      <h3 className="mt-10 text-[2rem] font-normal leading-tight" data-display="true">
                        {item.name}
                      </h3>
                      <p className="mt-5 text-[14px] leading-7 text-[var(--color-muted)] group-hover:text-[var(--color-ghost-white)]/72">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          price
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">{formatPrice(item.price_min, item.price_max)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          recovery
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">{item.recovery || "상담 후 확인"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          action
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">견적 요청</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
