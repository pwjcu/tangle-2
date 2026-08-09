"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { getCategoryMeta, normalizeCategoryName } from "../../../lib/siteContent";
import { getLocalTreatmentsByCategory } from "../../../lib/localTreatments";
import type { SupportedLanguage } from "../../../lib/i18n";
import { commonUi, formatPriceRange, localizeCategoryName } from "../../../lib/localizedUi";
import { useLanguage } from "../../components/LanguageProvider";

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

interface CategoryMetaView {
  headline: string;
  description: string;
  examples: string;
  audience: string;
}

interface CategoryPageCopy {
  back: string;
  eyebrow: string;
  why: string;
  typical: string;
  bestFor: string;
  treatmentEyebrow: string;
  treatmentTitle: string;
  loadingWord: string;
  loadingList: string;
  emptyList: string;
  csvLabel: string;
  painLabel: string;
  itemCount: (count: number) => string;
  requestSymptom: (name: string) => string;
  priceIndexCta: string;
  meta: (displayName: string) => CategoryMetaView;
}

const categoryPageCopy: Record<SupportedLanguage, CategoryPageCopy> = {
  ko: {
    back: "Back",
    eyebrow: "category inventory",
    why: "why it matters",
    typical: "typical items",
    bestFor: "best for",
    treatmentEyebrow: "treatment cards",
    treatmentTitle: "이 카테고리에서 비교 가능한 시술",
    loadingWord: "loading",
    loadingList: "시술 목록을 불러오는 중입니다.",
    emptyList: "아직 등록된 시술이 없습니다.",
    csvLabel: "2026 csv",
    painLabel: "pain",
    itemCount: (count) => `${count} items`,
    requestSymptom: (name) => `${name}에 관심이 있습니다.`,
    priceIndexCta: "이 카테고리 시술의 시장 가격 지수 보기",
    meta: (displayName) => ({
      headline: `${displayName} 시술 정보를 비교하고 내 고민에 맞는 선택지를 정리해보세요.`,
      description: "가격 범위, 회복 정보, 주의사항을 먼저 확인하면 과한 시술이나 불필요한 비용을 줄일 수 있습니다.",
      examples: "관련 시술 데이터 확인",
      audience: "팩트 기반 비교가 필요한 사용자",
    }),
  },
  en: {
    back: "Back",
    eyebrow: "category inventory",
    why: "why it matters",
    typical: "typical items",
    bestFor: "best for",
    treatmentEyebrow: "treatment cards",
    treatmentTitle: "Treatments you can compare in this category",
    loadingWord: "loading",
    loadingList: "Loading treatment list.",
    emptyList: "No treatments have been registered yet.",
    csvLabel: "2026 CSV",
    painLabel: "pain",
    itemCount: (count) => `${count} items`,
    requestSymptom: (name) => `I am interested in ${name}.`,
    priceIndexCta: "See the market price index for this category",
    meta: (displayName) => ({
      headline: `Compare ${displayName} options before requesting clinic quotes.`,
      description: "Check price ranges, recovery time, cautions, and possible combinations first so you can avoid excessive treatments and unnecessary cost.",
      examples: "Representative treatment options are listed below.",
      audience: "Users comparing options by concern, budget, and recovery time.",
    }),
  },
  zh: {
    back: "返回",
    eyebrow: "项目分类",
    why: "为什么重要",
    typical: "常见项目",
    bestFor: "适合人群",
    treatmentEyebrow: "项目卡片",
    treatmentTitle: "可在此分类中比较的项目",
    loadingWord: "加载中",
    loadingList: "正在加载项目列表。",
    emptyList: "暂时没有登记的项目。",
    csvLabel: "2026 CSV",
    painLabel: "疼痛",
    itemCount: (count) => `${count}项`,
    requestSymptom: (name) => `我对 ${name} 感兴趣。`,
    priceIndexCta: "查看该分类的市场价格行情",
    meta: (displayName) => ({
      headline: `申请医院报价前，先比较 ${displayName} 项目。`,
      description: "先确认价格范围、恢复时间、注意事项和可组合项目，可减少过度项目和不必要费用。",
      examples: "代表性项目会显示在下方。",
      audience: "适合按烦恼、预算和恢复时间比较选项的用户。",
    }),
  },
  ja: {
    back: "戻る",
    eyebrow: "カテゴリ一覧",
    why: "重要な理由",
    typical: "代表的な施術",
    bestFor: "おすすめ対象",
    treatmentEyebrow: "施術カード",
    treatmentTitle: "このカテゴリで比較できる施術",
    loadingWord: "読み込み中",
    loadingList: "施術一覧を読み込み中です。",
    emptyList: "登録された施術はまだありません。",
    csvLabel: "2026 CSV",
    painLabel: "痛み",
    itemCount: (count) => `${count}件`,
    requestSymptom: (name) => `${name} に関心があります。`,
    priceIndexCta: "このカテゴリの市場価格インデックスを見る",
    meta: (displayName) => ({
      headline: `見積依頼の前に ${displayName} の選択肢を比較しましょう。`,
      description: "価格帯、回復期間、注意点、組み合わせ候補を先に確認すると、過剰施術や不要な費用を減らせます。",
      examples: "代表的な施術候補は下に表示されます。",
      audience: "悩み、予算、回復時間を基準に比較したいユーザー。",
    }),
  },
  th: {
    back: "กลับ",
    eyebrow: "คลังหมวดหมู่",
    why: "เหตุผลที่สำคัญ",
    typical: "รายการทั่วไป",
    bestFor: "เหมาะสำหรับ",
    treatmentEyebrow: "การ์ดหัตถการ",
    treatmentTitle: "หัตถการที่เปรียบเทียบได้ในหมวดนี้",
    loadingWord: "กำลังโหลด",
    loadingList: "กำลังโหลดรายการหัตถการ",
    emptyList: "ยังไม่มีหัตถการที่ลงทะเบียน",
    csvLabel: "2026 CSV",
    painLabel: "ความเจ็บ",
    itemCount: (count) => `${count} รายการ`,
    requestSymptom: (name) => `ฉันสนใจ ${name}`,
    priceIndexCta: "ดูดัชนีราคาตลาดของหมวดนี้",
    meta: (displayName) => ({
      headline: `เปรียบเทียบตัวเลือก ${displayName} ก่อนขอราคาจากคลินิก`,
      description: "ตรวจช่วงราคา ระยะพักฟื้น ข้อควรระวัง และชุดที่อาจทำร่วมกันก่อน เพื่อหลีกเลี่ยงหัตถการเกินจำเป็นและค่าใช้จ่ายไม่จำเป็น",
      examples: "ตัวเลือกหัตถการหลักจะแสดงด้านล่าง",
      audience: "ผู้ใช้ที่ต้องการเปรียบเทียบตามปัญหา งบประมาณ และเวลาพักฟื้น",
    }),
  },
};

export default function CategoryPage() {
  const { language } = useLanguage();
  const copy = categoryPageCopy[language];
  const ui = commonUi[language];
  const params = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(params.name as string);
  const dataCategoryName = normalizeCategoryName(categoryName);
  const displayName = localizeCategoryName(categoryName, language);
  const sourceCategoryMeta = getCategoryMeta(categoryName);
  const categoryMeta = language === "ko" ? sourceCategoryMeta : copy.meta(displayName);

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
            {copy.back}
          </button>
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
        </div>
      </header>

      <main className="shell">
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              {displayName}
            </h1>
            <p className="mt-6 max-w-[720px] text-[17px] leading-8 text-[var(--color-muted)]">
              {categoryMeta.headline}
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <article className="border-b border-[var(--color-line)] p-5 sm:border-r sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{copy.why}</p>
              <p className="mt-8 text-[14px] leading-7 text-[var(--color-muted)]">{categoryMeta.description}</p>
            </article>
            <article className="border-b border-[var(--color-line)] p-5 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{copy.typical}</p>
              <p className="mt-8 text-[1.3rem] font-normal leading-8" data-display="true">
                {categoryMeta.examples}
              </p>
            </article>
            <article className="p-5 sm:col-span-2 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{copy.bestFor}</p>
              <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">{categoryMeta.audience}</p>
            </article>
          </div>
        </section>

        <section className="border-x border-b border-[var(--color-carbon)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">{copy.treatmentEyebrow}</p>
              <h2 className="type-section mt-5" data-display="true">
                {copy.treatmentTitle}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/prices" className="ghost-link">
                {copy.priceIndexCta} →
              </Link>
              <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
                {loading ? copy.loadingWord : copy.itemCount(list.length)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[14px] text-[var(--color-muted)]">{copy.loadingList}</div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center text-[14px] text-[var(--color-muted)]">{copy.emptyList}</div>
          ) : (
            <div className="grid lg:grid-cols-2">
              {list.map((item) => {
                const requestHref = `/request?${new URLSearchParams({
                  category: item.category,
                  budget: String(Math.round((item.price_min + item.price_max) / 2)),
                  symptom: copy.requestSymptom(item.name),
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
                          {item.isLocalSeed ? copy.csvLabel : localizeCategoryName(item.category, language)}
                        </span>
                        <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          {copy.painLabel} {item.pain_level}/5
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
                          {ui.price}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">{formatPriceRange(item.price_min, item.price_max, language)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          {ui.recovery}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">{item.recovery || ui.consultAfterConfirm}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                          {ui.action}
                        </p>
                        <p className="mt-2 text-[14px] font-semibold">{ui.requestQuote}</p>
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
