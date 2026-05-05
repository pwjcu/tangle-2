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
    shortLabel: "핵심 고민",
    title: "가장 먼저 해결하고 싶은 고민은 무엇인가요?",
    subtitle: "한 번에 모든 걸 묻기보다, 지금 가장 중요한 고민 하나를 기준점으로 잡습니다.",
    options: [
      { label: "탄력/리프팅", value: "탄력/리프팅", hint: "턱선, 처짐, 전체적인 탄력 저하가 고민일 때" },
      { label: "주름/노화", value: "주름/노화", hint: "잔주름, 깊은 주름, 노화 인상이 신경 쓰일 때" },
      { label: "피부결·모공", value: "피부결·모공", hint: "거친 결, 넓은 모공, 매끈하지 않은 피부결" },
      { label: "톤업/색소", value: "톤업/색소", hint: "칙칙함, 색소, 전체적인 피부톤 개선" },
      { label: "여드름·흉터", value: "여드름·흉터", hint: "흉터, 붉은 자국, 반복되는 트러블 흔적" },
      { label: "회복/항노화", value: "회복/항노화", hint: "컨디션, 회복 보조, 항산화·항노화 관리 관심" },
      { label: "바디라인", value: "바디라인", hint: "이중턱, 복부, 팔뚝 등 얼굴 외 라인 고민" },
    ],
  },
  {
    key: "budget",
    shortLabel: "예산대",
    title: "이번에 생각하는 예산은 어느 정도인가요?",
    subtitle: "총액 기준으로 무리 없는 조합을 먼저 선별하고, 과한 시술은 뒤로 미룹니다.",
    options: [
      { label: "50만원 이하", value: "50", hint: "입문형 시술이나 단일 시술 중심" },
      { label: "80만원대", value: "80", hint: "가벼운 조합까지 고려 가능" },
      { label: "120만원대", value: "120", hint: "효과와 안정성을 균형 있게 보기 좋은 구간" },
      { label: "180만원대", value: "180", hint: "중상급 조합까지 검토 가능" },
      { label: "250만원 이상", value: "250", hint: "고가 리프팅 포함 가능성" },
    ],
  },
  {
    key: "age",
    shortLabel: "연령대",
    title: "현재 연령대는 어디에 가까운가요?",
    subtitle: "절대 기준은 아니지만, 기대 효과와 추천 강도를 조절하는 참고값으로 사용합니다.",
    options: [
      { label: "20대", value: "20대", hint: "과한 시술보다 입문형·예방형 위주" },
      { label: "30대", value: "30대", hint: "자연스러운 개선과 균형 중심" },
      { label: "40대", value: "40대", hint: "체감 변화와 유지력을 함께 고려" },
      { label: "50대 이상", value: "50대 이상", hint: "효과 체감이 큰 메인 시술 우선 검토" },
    ],
  },
  {
    key: "goal",
    shortLabel: "원하는 결과",
    title: "이번에는 어떤 결과를 가장 원하시나요?",
    subtitle: "같은 예산이어도 변화 강도에 따라 추천 조합이 달라집니다.",
    options: [
      { label: "자연스럽게 정리", value: "자연스럽게 정리", hint: "티 나지 않으면서 깔끔한 변화" },
      { label: "확실한 변화", value: "확실한 변화", hint: "눈에 보이는 체감 변화를 우선" },
      { label: "가성비 중심", value: "가성비 중심", hint: "총액 효율과 유지 비용을 우선" },
      { label: "시술 입문", value: "시술 입문", hint: "부담이 적은 첫 경험을 선호" },
    ],
  },
  {
    key: "downtime",
    shortLabel: "회복 허용도",
    title: "다운타임은 어느 정도까지 괜찮으신가요?",
    subtitle: "회복 부담이 적은 시술을 원할지, 효과 중심으로 갈지를 정하는 중요한 기준입니다.",
    options: [
      { label: "거의 없었으면 좋겠어요", value: "low", hint: "당일 일상 복귀가 중요" },
      { label: "며칠 정도는 괜찮아요", value: "medium", hint: "가벼운 붓기와 붉음은 허용" },
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

const briefingPoints = [
  "예산 범위 안에서 가능한 조합인지 먼저 좁힙니다.",
  "회복 부담과 주의사항을 결과 카드에 함께 표시합니다.",
  "추천 결과는 바로 견적 요청으로 이어집니다.",
];

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

function buildAnswerPreview(answers: Record<QuestionKey, string>) {
  return questions
    .map((question) => ({
      key: question.key,
      label: question.shortLabel,
      value: answers[question.key],
    }))
    .filter((item) => item.value);
}

export default function RecommendPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const activeQuestion = questions[stepIndex];
  const isComplete = Boolean(result);
  const answerPreview = buildAnswerPreview(answers);

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
      alert("추천 결과를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.");
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
    <div className="pb-28 pt-4 sm:pb-12 sm:pt-5">
      <div className="shell">
        <nav className="mb-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-[13px] font-semibold text-stone-500 hover:text-stone-950">
            홈으로
          </Link>
          <button onClick={handleRestart} className="text-[13px] font-semibold text-stone-400 hover:text-stone-700">
            처음부터 다시
          </button>
        </nav>

        <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            <section className="panel px-5 py-5 sm:px-6">
              <p className="eyebrow mb-3">recommendation briefing</p>
              <h1 className="type-title balance !text-[2rem] sm:!text-[2.2rem]" data-display="true">
                긴 설문보다 빠르고
                <br />
                근거 있는 추천
              </h1>
              <p className="mt-4 type-copy">
                추천이 신뢰를 얻으려면 고민, 예산, 원하는 변화, 회복 허용도를 함께 봐야 합니다. 탱글은 그
                판단 구조를 짧은 질문 카드로 정리합니다.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {briefingPoints.map((label) => (
                  <div key={label} className="metric-tile">
                    <p className="text-[13px] font-medium leading-6 text-stone-700">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                    progress map
                  </p>
                  <h2 className="mt-2 text-[1rem] font-semibold text-stone-950">현재 입력 상태</h2>
                </div>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-stone-500">
                  {isComplete ? "완료" : `${stepIndex + 1}/${questions.length}`}
                </span>
              </div>

              <div className="mt-4 snap-strip xl:grid xl:grid-cols-1 xl:overflow-visible xl:px-0 xl:pb-0">
                {questions.map((question, index) => {
                  const isActive = index === stepIndex && !loading && !isComplete;
                  const isAnswered = Boolean(answers[question.key]);

                  return (
                    <article
                      key={question.key}
                      className={`snap-card rounded-[18px] border px-4 py-3 lg:w-auto ${
                        isActive
                          ? "border-[#6b38d4] bg-[#6b38d4] text-white"
                          : isAnswered
                            ? "border-stone-200 bg-white text-stone-700"
                            : "border-stone-200/80 bg-white/70 text-stone-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                          {question.shortLabel}
                        </span>
                        <span className="text-[11px]">{index + 1}</span>
                      </div>
                      <p className="mt-2 text-[14px] font-semibold leading-6">{question.title}</p>
                      {answers[question.key] && (
                        <p className={`mt-2 text-[12px] leading-5 ${isActive ? "text-white/75" : "text-stone-500"}`}>
                          {answers[question.key]}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </aside>

          <main className="panel min-h-[680px] px-5 py-5 sm:px-6 sm:py-6">
            {!loading && !isComplete && activeQuestion && (
              <div className="animate-fade-up flex h-full flex-col gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="eyebrow">step {stepIndex + 1}</span>
                    <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-[#6b38d4]"
                        style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[12px] leading-5 text-stone-400">
                    한 질문씩 빠르게 선택하면 결과가 자동으로 정리됩니다.
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                  <section className="flex flex-col justify-between">
                    <div>
                      <h2
                        className="balance text-[1.85rem] font-semibold leading-[1.06] text-stone-950 sm:text-[2.25rem]"
                        data-display="true"
                      >
                        {activeQuestion.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-[14px] leading-7 text-stone-600">
                        {activeQuestion.subtitle}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {activeQuestion.options.map((option) => {
                        const isSelected = answers[activeQuestion.key] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleOptionSelect(option.value)}
                            className={`option-card ${isSelected ? "option-card-active" : ""}`}
                          >
                            <span className="block text-[1rem] font-semibold text-stone-950">{option.label}</span>
                            <span className="mt-2 block text-[13px] leading-6 text-stone-500">{option.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <section className="soft-panel p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        answer preview
                      </p>
                      <h3 className="mt-2 text-[1rem] font-semibold text-stone-950">지금까지의 입력</h3>
                      <div className="mt-4 space-y-3">
                        {answerPreview.length === 0 ? (
                          <p className="text-[13px] leading-6 text-stone-500">
                            아직 입력된 내용이 없습니다. 첫 질문부터 하나씩 고르면 추천 준비가 시작됩니다.
                          </p>
                        ) : (
                          answerPreview.map((item) => (
                            <div key={item.key} className="rounded-[16px] border border-stone-200 bg-white px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                                {item.label}
                              </p>
                              <p className="mt-2 text-[14px] font-medium text-stone-800">{item.value}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </section>

                    <section className="soft-panel p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        why this works
                      </p>
                      <div className="mt-3 space-y-3 text-[13px] leading-6 text-stone-600">
                        <p>질문을 줄이되 판단 기준은 빠지지 않게 설계해 과도한 설문 피로를 줄였습니다.</p>
                        <p>추천 결과는 바로 견적 요청으로 이어져 사용자가 다시 내용을 복사하지 않아도 됩니다.</p>
                      </div>
                    </section>
                  </aside>
                </div>

                <div className="mt-auto hidden items-center justify-between gap-3 border-t border-stone-200 pt-4 sm:flex">
                  <button
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전 질문
                  </button>
                  <p className="text-[12px] leading-5 text-stone-400">마지막 질문 뒤에는 추천 결과가 자동으로 생성됩니다.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center animate-fade-up">
                <div className="mb-4 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#6b38d4] shadow-sm">
                  recommendation engine
                </div>
                <h3 className="balance text-[2rem] font-semibold leading-[1.05] text-stone-950" data-display="true">
                  예산과 고민에 맞는 조합을
                  <br />
                  정리하고 있어요
                </h3>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-stone-600">
                  먼저 데이터베이스에서 예산과 고민에 맞는 후보를 고르고, 그 후보를 바탕으로 이해하기 쉬운 추천
                  결과를 정리합니다.
                </p>
              </div>
            )}

            {isComplete && result && (
              <div className="animate-fade-up space-y-5">
                <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                  <section className="rounded-[22px] border border-stone-200 bg-white px-5 py-5 sm:px-6">
                    <p className="eyebrow mb-3">recommendation result</p>
                    <h2
                      className="balance text-[2rem] font-semibold leading-[1.04] text-stone-950 sm:text-[2.35rem]"
                      data-display="true"
                    >
                      {result.strategyTitle}
                    </h2>
                    <p className="mt-4 text-[14px] leading-7 text-stone-600">{result.summary}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          estimated total
                        </p>
                        <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                          {formatPrice(result.totalPrice)}
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          suggested items
                        </p>
                        <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                          {result.items.length}개
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          next action
                        </p>
                        <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                          견적 연결
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-4">
                    <article className="soft-panel p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        confidence notes
                      </p>
                      <ul className="mt-4 space-y-3 text-[13px] leading-6 text-stone-700">
                        {(result.confidenceNotes || []).map((note) => (
                          <li key={note} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#6b38d4]" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </article>

                    <article className="soft-panel p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                            budget fit
                          </p>
                          <p className="mt-2 text-[13px] leading-6 text-stone-700">{result.budgetFit}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                            caution
                          </p>
                          <p className="mt-2 text-[13px] leading-6 text-stone-700">{result.caution}</p>
                        </div>
                      </div>
                    </article>
                  </section>
                </div>

                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="eyebrow mb-3">treatment cards</p>
                      <h3 className="type-section" data-display="true">
                        추천 조합 카드
                      </h3>
                    </div>
                    <span className="hidden text-[12px] text-stone-400 sm:inline">
                      모바일에서는 카드처럼 넘기고, 데스크톱에서는 한 번에 비교할 수 있습니다.
                    </span>
                  </div>

                  <div className="snap-strip xl:grid xl:grid-cols-2 xl:overflow-visible xl:px-0 xl:pb-0">
                    {result.items.map((item) => (
                      <article key={item.name} className="snap-card soft-panel flex h-full flex-col p-5 lg:w-auto">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                              {item.category}
                            </span>
                            <h4 className="mt-3 text-[1.15rem] font-semibold text-stone-950">{item.name}</h4>
                          </div>
                          <span className="text-[1.1rem] font-semibold text-[#6b38d4]" data-display="true">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <p className="mt-3 text-[13px] leading-6 text-stone-600">{item.description}</p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[16px] bg-stone-50 px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                              추천 이유
                            </p>
                            <p className="mt-2 text-[13px] leading-6 text-stone-700">{item.reason}</p>
                          </div>
                          <div className="rounded-[16px] bg-stone-50 px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                              회복
                            </p>
                            <p className="mt-2 text-[13px] leading-6 text-stone-700">{item.recovery}</p>
                          </div>
                          <div className="rounded-[16px] bg-stone-50 px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                              시너지
                            </p>
                            <p className="mt-2 text-[13px] leading-6 text-stone-700">{item.synergy || "단독 진행 가능"}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-[13px] leading-6 text-stone-500">
                          <span className="font-semibold text-stone-700">주의사항</span> {item.sideEffects}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="eyebrow mb-3">next step</p>
                      <h3 className="type-section" data-display="true">
                        이 조합을 기준으로 병원 제안을 받아볼까요?
                      </h3>
                      <p className="mt-2 text-[14px] leading-7 text-stone-600">
                        추천 결과와 핵심 고민이 자동으로 견적 요청서에 들어갑니다. 사용자는 추가 정보를 조금만 보완하면
                        됩니다.
                      </p>
                    </div>
                    <Link href={getRequestHref(result, answers)} className="action-primary text-center">
                      견적 요청으로 이어가기
                    </Link>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      {!loading && !isComplete && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e4daf9] bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="rounded-full border border-stone-200 px-4 py-2.5 text-[13px] font-semibold text-stone-700 disabled:opacity-40"
            >
              이전
            </button>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                current step
              </p>
              <p className="text-[13px] font-semibold text-stone-900">
                {stepIndex + 1}/{questions.length} · {activeQuestion?.shortLabel}
              </p>
            </div>
          </div>
        </div>
      )}

      {isComplete && result && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e4daf9] bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">estimated total</p>
              <p className="text-[14px] font-semibold text-stone-950">{formatPrice(result.totalPrice)}</p>
            </div>
            <Link href={getRequestHref(result, answers)} className="action-primary !rounded-full !px-4 !py-2.5 !text-sm">
              견적 요청
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
