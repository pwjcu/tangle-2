"use client";

import Link from "next/link";
import { useState } from "react";

type QuestionKey = "concern" | "budget" | "age" | "goal" | "downtime";

interface Option {
  label: string;
  value: string;
  hint: string;
}

interface Question {
  key: QuestionKey;
  title: string;
  subtitle: string;
  shortLabel: string;
  options: Option[];
}

interface RecommendationItem {
  name: string;
  category: string;
  price: number;
  description: string;
  reason: string;
  recovery: string;
  sideEffects: string;
  synergy: string;
}

interface RecommendationResult {
  strategyTitle: string;
  summary: string;
  budgetFit: string;
  caution: string;
  totalPrice: number;
  requestCategory: string;
  requestSummary: string;
  confidenceNotes: string[];
  items: RecommendationItem[];
}

const questions: Question[] = [
  {
    key: "concern",
    shortLabel: "concern",
    title: "지금 가장 먼저 해결하고 싶은 고민은 무엇인가요?",
    subtitle: "모든 고민을 한 번에 풀기보다, 병원 제안의 기준이 될 핵심 고민 하나를 먼저 정합니다.",
    options: [
      { label: "탄력/리프팅", value: "탄력/리프팅", hint: "처짐, 턱선, 얼굴 탄력 저하" },
      { label: "주름/노화", value: "주름/노화", hint: "잔주름, 표정주름, 노화 인상" },
      { label: "피부결·모공", value: "피부결·모공", hint: "거친 결, 모공, 푸석함" },
      { label: "톤업/색소", value: "톤업/색소", hint: "기미, 잡티, 색소, 칙칙함" },
      { label: "여드름·흉터", value: "여드름·흉터", hint: "흉터, 붉은 자국, 반복 여드름" },
      { label: "회복/항노화", value: "회복/항노화", hint: "컨디션, 회복 보조, 항노화 관리" },
      { label: "바디라인", value: "바디라인", hint: "이중턱, 복부, 팔, 허벅지 라인" },
    ],
  },
  {
    key: "budget",
    shortLabel: "budget",
    title: "이번에 생각하는 예산은 어느 정도인가요?",
    subtitle: "총액 기준으로 무리 없는 후보를 먼저 고르고, 예산을 벗어나는 조합은 후순위로 둡니다.",
    options: [
      { label: "50만원 이하", value: "50", hint: "입문 시술이나 단일 관리 중심" },
      { label: "80만원대", value: "80", hint: "가벼운 조합까지 검토 가능" },
      { label: "120만원대", value: "120", hint: "체감 변화와 안정성의 균형" },
      { label: "180만원대", value: "180", hint: "중상급 조합까지 탐색" },
      { label: "250만원 이상", value: "250", hint: "고가 리프팅과 패키지 후보 포함" },
    ],
  },
  {
    key: "age",
    shortLabel: "age",
    title: "현재 나이대는 어디에 가까운가요?",
    subtitle: "나이는 정답이 아니라 추천 강도를 조절하는 참고값으로 사용합니다.",
    options: [
      { label: "20대", value: "20대", hint: "예방과 가벼운 개선 중심" },
      { label: "30대", value: "30대", hint: "자연스러운 개선과 유지 관리" },
      { label: "40대", value: "40대", hint: "처짐과 탄력 변화를 함께 고려" },
      { label: "50대 이상", value: "50대 이상", hint: "체감 변화와 회복 조건을 함께 검토" },
    ],
  },
  {
    key: "goal",
    shortLabel: "goal",
    title: "이번 선택에서 가장 원하는 결과는 무엇인가요?",
    subtitle: "같은 예산이어도 결과 강도에 따라 추천 조합이 달라집니다.",
    options: [
      { label: "자연스럽게 정리", value: "자연스럽게 정리", hint: "티 나지 않는 변화" },
      { label: "확실한 변화", value: "확실한 변화", hint: "눈에 보이는 체감 변화" },
      { label: "가성비 중심", value: "가성비 중심", hint: "총액 효율과 유지 비용 우선" },
      { label: "시술 입문", value: "시술 입문", hint: "부담이 낮은 첫 경험" },
    ],
  },
  {
    key: "downtime",
    shortLabel: "recovery",
    title: "다운타임은 어느 정도까지 괜찮나요?",
    subtitle: "회복 부담을 줄일지, 효과 체감을 우선할지 정하는 중요한 기준입니다.",
    options: [
      { label: "거의 없었으면 좋겠어요", value: "low", hint: "당일 일상 복귀가 중요" },
      { label: "며칠 정도는 괜찮아요", value: "medium", hint: "가벼운 붓기와 멍은 허용" },
      { label: "효과가 좋다면 감수 가능", value: "high", hint: "회복보다 결과를 우선" },
    ],
  },
];

const initialAnswers: Record<QuestionKey, string> = {
  concern: "",
  budget: "",
  age: "",
  goal: "",
  downtime: "",
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}만원`;
}

function getRequestHref(result: RecommendationResult, answers: Record<QuestionKey, string>) {
  const params = new URLSearchParams({
    category: result.requestCategory,
    budget: String(result.totalPrice || answers.budget),
    concern: answers.concern,
    symptom: result.requestSummary,
    recommended: result.items.map((item) => item.name).join(", "),
  });

  return `/request?${params.toString()}`;
}

export default function RecommendPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const activeQuestion = questions[stepIndex];
  const isComplete = Boolean(result);

  const submitRecommendation = async (nextAnswers: Record<QuestionKey, string>) => {
    setLoading(true);

    try {
      const response = await fetch("/api/recommend-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextAnswers),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "추천 생성 실패");
      }

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("추천 결과를 가져오지 못했어요. 잠시 후 다시 시도해주세요.");
      setStepIndex(0);
      setAnswers(initialAnswers);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (value: string) => {
    if (!activeQuestion) return;

    const nextAnswers = {
      ...answers,
      [activeQuestion.key]: value,
    };

    setAnswers(nextAnswers);

    if (stepIndex === questions.length - 1) {
      void submitRecommendation(nextAnswers);
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setAnswers(initialAnswers);
    setResult(null);
    setLoading(false);
    setStepIndex(0);
  };

  const handleBack = () => {
    if (loading) return;
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="pb-12">
      <header className="sticky top-4 z-30">
        <div className="shell flex min-h-[64px] items-center justify-between rounded-full border border-[rgba(23,21,14,0.08)] bg-white/88 px-4 py-2 backdrop-blur">
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
          <button onClick={handleRestart} className="ghost-link">
            Restart
          </button>
        </div>
      </header>

      <main className="shell pt-8">
        <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[36px] bg-white p-5 sm:p-8">
            <p className="eyebrow">AI 맞춤 추천</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4rem]" data-display="true">
              고객 설문 기반
              <br />
              AI 맞춤형 추천
            </h1>
            <p className="mt-7 type-copy">
              긴 상담 전에 필요한 기준만 묻습니다. 고민, 예산, 나이대, 원하는 변화, 다운타임을 기준으로 추천 후보를 정리합니다.
            </p>

            <div className="mt-10 grid gap-3">
              {questions.map((question, index) => {
                const isActive = index === stepIndex && !loading && !isComplete;
                const value = answers[question.key];

                return (
                  <article
                    key={question.key}
                    className={`rounded-3xl px-4 py-4 ${isActive ? "bg-[var(--color-genius-yellow)] text-[var(--color-carbon)]" : "bg-[var(--color-porcelain-gray)] text-[var(--color-muted)]"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em]">{question.shortLabel}</span>
                      <span className="text-[11px] uppercase tracking-[0.22em]">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-3 text-[14px] font-semibold leading-6">{value || question.title}</p>
                  </article>
                );
              })}
            </div>
          </aside>

          <section className="min-h-[720px] rounded-[36px] bg-white p-5 sm:p-8">
            {!loading && !isComplete && activeQuestion && (
              <div className="animate-fade-up flex min-h-[660px] flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">step {stepIndex + 1}</p>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
                      {stepIndex + 1}/{questions.length}
                    </p>
                  </div>

                  <h2 className="type-section mt-8 max-w-[920px]" data-display="true">
                    {activeQuestion.title}
                  </h2>
                  <p className="mt-5 max-w-[760px] type-copy">{activeQuestion.subtitle}</p>

                  <div className="mt-10 grid gap-3 md:grid-cols-2">
                    {activeQuestion.options.map((option) => {
                      const isSelected = answers[activeQuestion.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleOptionSelect(option.value)}
                          className={`option-card min-h-[170px] ${
                            isSelected ? "option-card-active" : ""
                          }`}
                        >
                          <span className="block text-[1.4rem] font-normal leading-tight" data-display="true">
                            {option.label}
                          </span>
                          <span className="mt-5 block text-[13px] leading-6 opacity-70">{option.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-5">
                  <button onClick={handleBack} disabled={stepIndex === 0} className="ghost-link disabled:opacity-30">
                    Previous
                  </button>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
                    마지막 질문 뒤 결과가 자동 생성됩니다
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[660px] flex-col items-center justify-center text-center animate-fade-up">
                <p className="eyebrow">recommendation engine</p>
                <h2 className="type-section mt-8" data-display="true">
                  예산과 고민에 맞는 조합을
                  <br />
                  정리하고 있습니다
                </h2>
                <p className="mt-5 max-w-xl type-copy">
                  Supabase 데이터와 2026 CSV 후보를 함께 보고, 과한 조합을 제외한 후보를 우선 정리합니다.
                </p>
              </div>
            )}

            {isComplete && result && (
              <div className="animate-fade-up">
                <p className="eyebrow">recommendation result</p>
                <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
                  <div>
                    <h2 className="type-section" data-display="true">
                      {result.strategyTitle}
                    </h2>
                    <p className="mt-5 type-copy">{result.summary}</p>
                  </div>
                  <div className="rounded-[28px] bg-[var(--color-porcelain-gray)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                      estimated total
                    </p>
                    <p className="mt-6 text-[2.2rem] font-normal leading-none" data-display="true">
                      {formatPrice(result.totalPrice)}
                    </p>
                    <Link href={getRequestHref(result, answers)} className="action-primary mt-8 w-full">
                      견적 요청으로 이동
                    </Link>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 xl:grid-cols-3">
                  {result.items.map((item) => (
                    <article key={item.name} className="rounded-[28px] border border-[var(--color-silver-mist)] bg-white p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                        {item.category}
                      </p>
                      <h3 className="mt-8 text-[1.7rem] font-normal leading-tight" data-display="true">
                        {item.name}
                      </h3>
                      <p className="mt-4 text-[1.1rem] font-semibold">{formatPrice(item.price)}</p>
                      <p className="mt-5 text-[13px] leading-6 text-[var(--color-muted)]">{item.description}</p>
                      <div className="mt-6 space-y-3 text-[13px] leading-6">
                        <p>
                          <span className="font-semibold">추천 이유</span> {item.reason}
                        </p>
                        <p>
                          <span className="font-semibold">회복</span> {item.recovery}
                        </p>
                        <p>
                          <span className="font-semibold">주의</span> {item.sideEffects}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {[result.budgetFit, result.caution, ...(result.confidenceNotes || []).slice(0, 1)].map((note) => (
                    <article key={note} className="rounded-[24px] bg-[var(--color-porcelain-gray)] p-5">
                      <p className="text-[13px] leading-7 text-[var(--color-muted)]">{note}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
