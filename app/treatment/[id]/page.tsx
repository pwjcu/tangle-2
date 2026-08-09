"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import type { SupportedLanguage } from "../../../lib/i18n";
import { commonUi, formatPriceRange, localizeCategoryName } from "../../../lib/localizedUi";
import { useLanguage } from "../../components/LanguageProvider";

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

interface TreatmentDetailCopy {
  back: string;
  loadFail: string;
  labels: {
    priceRange: string;
    painLevel: string;
    cycle: string;
    recovery: string;
    sideEffects: string;
    synergy: string;
  };
  decisionEyebrow: string;
  decisionTitle: string[];
  nextStep: string;
  nextStepText: string;
  priceIndexCta: string;
  requestSymptom: (name: string) => string;
}

const treatmentCopy: Record<SupportedLanguage, TreatmentDetailCopy> = {
  ko: {
    back: "Back",
    loadFail: "시술 정보를 불러오지 못했습니다.",
    labels: {
      priceRange: "price range",
      painLevel: "pain level",
      cycle: "cycle",
      recovery: "recovery",
      sideEffects: "side effects",
      synergy: "synergy",
    },
    decisionEyebrow: "decision support",
    decisionTitle: ["이 시술에서 먼저", "확인해야 할 기준"],
    nextStep: "next step",
    nextStepText: "조건에 맞는 병원 제안을 받아보세요.",
    priceIndexCta: "시장 가격 지수 보기",
    requestSymptom: (name) => `${name}에 관심이 있습니다.`,
  },
  en: {
    back: "Back",
    loadFail: "Could not load treatment information.",
    labels: {
      priceRange: "price range",
      painLevel: "pain level",
      cycle: "cycle",
      recovery: "recovery",
      sideEffects: "side effects",
      synergy: "synergy",
    },
    decisionEyebrow: "decision support",
    decisionTitle: ["Criteria to check", "before choosing"],
    nextStep: "next step",
    nextStepText: "Get clinic offers that match your conditions.",
    priceIndexCta: "See market price index",
    requestSymptom: (name) => `I am interested in ${name}.`,
  },
  zh: {
    back: "返回",
    loadFail: "无法加载项目信息。",
    labels: {
      priceRange: "价格范围",
      painLevel: "疼痛程度",
      cycle: "建议周期",
      recovery: "恢复",
      sideEffects: "副作用",
      synergy: "可组合项目",
    },
    decisionEyebrow: "选择辅助",
    decisionTitle: ["此项目需要先", "确认的标准"],
    nextStep: "下一步",
    nextStepText: "获取符合条件的医院提案。",
    priceIndexCta: "查看市场价格行情",
    requestSymptom: (name) => `我对 ${name} 感兴趣。`,
  },
  ja: {
    back: "戻る",
    loadFail: "施術情報を読み込めませんでした。",
    labels: {
      priceRange: "価格帯",
      painLevel: "痛みレベル",
      cycle: "周期",
      recovery: "回復",
      sideEffects: "副作用",
      synergy: "組み合わせ",
    },
    decisionEyebrow: "判断サポート",
    decisionTitle: ["この施術で先に", "確認すべき基準"],
    nextStep: "次のステップ",
    nextStepText: "条件に合うクリニック提案を受け取りましょう。",
    priceIndexCta: "市場価格インデックスを見る",
    requestSymptom: (name) => `${name} に関心があります。`,
  },
  th: {
    back: "กลับ",
    loadFail: "ไม่สามารถโหลดข้อมูลหัตถการได้",
    labels: {
      priceRange: "ช่วงราคา",
      painLevel: "ระดับความเจ็บ",
      cycle: "รอบแนะนำ",
      recovery: "พักฟื้น",
      sideEffects: "ผลข้างเคียง",
      synergy: "ทำร่วมกันได้",
    },
    decisionEyebrow: "ช่วยตัดสินใจ",
    decisionTitle: ["เกณฑ์ที่ควรตรวจ", "ก่อนเลือกหัตถการนี้"],
    nextStep: "ขั้นตอนถัดไป",
    nextStepText: "รับข้อเสนอจากคลินิกที่ตรงกับเงื่อนไขของคุณ",
    priceIndexCta: "ดูดัชนีราคาตลาด",
    requestSymptom: (name) => `ฉันสนใจ ${name}`,
  },
};

export default function TreatmentDetailPage() {
  const { language } = useLanguage();
  const copy = treatmentCopy[language];
  const ui = commonUi[language];
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
        alert(copy.loadFail);
        router.push("/recommend");
      } else {
        setTreatment(data);
      }
      setLoading(false);
    };

    void fetchDetail();
  }, [id, router, copy.loadFail]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-[var(--color-muted)]">{ui.loading}</div>;
  }

  if (!treatment) {
    return <div className="p-10 text-center text-[var(--color-muted)]">{ui.noData}</div>;
  }

  const requestHref = `/request?${new URLSearchParams({
    category: treatment.category,
    budget: String(Math.round((treatment.price_min + treatment.price_max) / 2)),
    symptom: copy.requestSymptom(treatment.name),
  }).toString()}`;

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
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">{localizeCategoryName(treatment.category, language)}</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              {treatment.name}
            </h1>
            <p className="mt-7 max-w-[760px] text-[16px] leading-8 text-[var(--color-muted)]">
              {treatment.description}
            </p>
          </div>

          <aside className="grid sm:grid-cols-2">
            <InfoBlock label={copy.labels.priceRange} value={formatPriceRange(treatment.price_min, treatment.price_max, language)} />
            <InfoBlock label={copy.labels.painLevel} value={`${treatment.pain_level}/5`} />
            <InfoBlock label={copy.labels.cycle} value={treatment.cycle || ui.consultAfterConfirm} />
            <InfoBlock label={copy.labels.recovery} value={treatment.recovery || ui.consultAfterConfirm} />
          </aside>
        </section>

        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">{copy.decisionEyebrow}</p>
            <h2 className="type-section mt-6" data-display="true">
              {copy.decisionTitle.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </div>

          <div className="grid md:grid-cols-3">
            <InfoBlock label={copy.labels.sideEffects} value={treatment.side_effects || ui.consultAfterConfirm} />
            <InfoBlock label={copy.labels.synergy} value={treatment.synergy || ui.standalonePossible} />
            <article className="flex min-h-[240px] flex-col justify-between border-b border-[var(--color-line)] p-5 md:border-r md:last:border-r-0 sm:p-7">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{copy.nextStep}</p>
                <p className="mt-8 text-[1.4rem] font-normal leading-tight" data-display="true">
                  {copy.nextStepText}
                </p>
              </div>
              <Link href={requestHref} className="action-primary mt-8 w-full">
                {ui.requestQuote}
              </Link>
              <Link
                href={`/prices/${encodeURIComponent(treatment.name)}`}
                className="ghost-link mt-3 inline-block"
              >
                {copy.priceIndexCta} →
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
