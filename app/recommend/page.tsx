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
    subtitle: "막연한 검색 대신 가장 큰 고민 하나를 기준으로 추천 방향을 잡습니다.",
    options: [
      { label: "탄력/리프팅", value: "탄력/리프팅", hint: "턱선, 볼 처짐, 전체적인 탄력 저하" },
      { label: "주름/노화", value: "주름/노화", hint: "잔주름, 노화 징후, 전체적인 인상 변화" },
      { label: "피부결/모공", value: "피부결/모공", hint: "거친 결, 넓은 모공, 화장 밀림" },
      { label: "잡티/색소", value: "잡티/색소", hint: "칙칙함, 색소, 톤 불균형" },
      { label: "여드름/흉터", value: "여드름/흉터", hint: "패인 흉터, 붉은 흔적, 반복 트러블" },
    ],
  },
  {
    key: "budget",
    shortLabel: "예산대",
    title: "이번에 생각한 예산대는 어느 정도인가요?",
    subtitle: "총액 기준으로 부담 없는 조합을 우선 만들고, 과한 시술은 뒤로 미룹니다.",
    options: [
      { label: "50만원 이하", value: "50", hint: "입문형 또는 단일 시술 중심" },
      { label: "80만원대", value: "80", hint: "가벼운 조합 시도 가능" },
      { label: "120만원대", value: "120", hint: "효과와 안정성을 함께 보기 좋은 구간" },
      { label: "180만원대", value: "180", hint: "중상급 조합 추천 가능" },
      { label: "250만원 이상", value: "250", hint: "고가 리프팅 포함 가능성" },
    ],
  },
  {
    key: "age",
    shortLabel: "연령대",
    title: "현재 연령대는 어디에 가까운가요?",
    subtitle: "기대 변화 폭과 유지형 시술 비중을 조정하는 데 참고합니다.",
    options: [
      { label: "20대", value: "20대", hint: "과한 시술보다 입문형 조합 우선" },
      { label: "30대", value: "30대", hint: "예방과 개선의 균형" },
      { label: "40대", value: "40대", hint: "체감 변화와 유지 전략을 함께 고려" },
      { label: "50대 이상", value: "50대 이상", hint: "효율 높은 메인 시술 우선" },
    ],
  },
  {
    key: "goal",
    shortLabel: "원하는 결과",
    title: "이번에는 어떤 결과를 더 원하시나요?",
    subtitle: "예산이 같아도 원하는 변화 강도에 따라 추천 조합이 달라집니다.",
    options: [
      { label: "자연스럽게 정리", value: "자연스럽게 정리", hint: "티 나지 않는 개선 선호" },
      { label: "확실한 변화", value: "확실한 변화", hint: "눈에 띄는 체감 변화 우선" },
      { label: "가성비 중심", value: "가성비 중심", hint: "총액 효율과 유지 비용 우선" },
      { label: "시술 입문용", value: "시술 입문용", hint: "부담 적은 첫 경험 선호" },
    ],
  },
  {
    key: "downtime",
    shortLabel: "회복 허용도",
    title: "회복 부담은 어느 정도까지 괜찮으신가요?",
    subtitle: "다운타임 허용도는 추천의 현실성을 크게 좌우합니다.",
    options: [
      { label: "거의 없었으면 해요", value: "low", hint: "당일 생활 가능 위주" },
      { label: "하루 이틀은 괜찮아요", value: "medium", hint: "가벼운 붉음이나 붓기 허용" },
      { label: "효과가 좋다면 감수 가능", value: "high", hint: "회복 기간보다 결과 우선" },
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

const trustLabels = [
  "예산 범위에 맞는지 먼저 점검",
  "회복·주의사항을 결과에 함께 표기",
  "추천 조합을 견적 요청서로 바로 전달",
];

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
      alert("추천을 가져오지 못했어요. 잠시 후 다시 시도해주세요.");
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
    <div className="pb-10 pt-4 sm:pt-5">
      <div className="shell">
        <nav className="mb-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-[13px] font-semibold text-stone-500 hover:text-stone-950">
            ← 홈으로
          </Link>
          <button
            onClick={handleRestart}
            className="text-[13px] font-semibold text-stone-400 hover:text-stone-700"
          >
            처음부터 다시
          </button>
        </nav>

        <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            <section className="panel px-5 py-5 sm:px-6">
              <p className="eyebrow mb-3">recommendation briefing</p>
              <h1 className="type-title balance !text-[2rem] sm:!text-[2.2rem]" data-display="true">
                긴 설문보다
                <br />
                빠르고 근거 있는 추천
              </h1>
              <p className="mt-4 type-copy">
                추천이 신뢰를 얻으려면 “뭐가 좋아요?” 대신 어떤 고민을 얼마까지, 어느 정도 회복 부담으로
                풀고 싶은지를 먼저 정리해야 합니다.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {trustLabels.map((label) => (
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
                          ? "border-stone-900 bg-stone-900 text-white"
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
                        <p className={`mt-2 text-[12px] leading-5 ${isActive ? "text-white/72" : "text-stone-500"}`}>
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
                        className="h-full rounded-full bg-stone-950"
                        style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[12px] leading-5 text-stone-400">
                    한 질문마다 가장 현실적인 선택지를 빠르게 좁힙니다.
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                  <section className="flex flex-col justify-between">
                    <div>
                      <h2 className="balance text-[1.85rem] font-semibold leading-[1.06] text-stone-950 sm:text-[2.25rem]" data-display="true">
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
                            <span className="block text-[1rem] font-semibold text-stone-950">
                              {option.label}
                            </span>
                            <span className="mt-2 block text-[13px] leading-6 text-stone-500">
                              {option.hint}
                            </span>
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
                            아직 입력된 답변이 없습니다. 첫 질문부터 하나씩 고르면 추천 준비가 시작됩니다.
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
                        <p>한 번에 너무 많은 문항을 보여주지 않고 현재 질문에만 집중하게 만듭니다.</p>
                        <p>추천 후 바로 견적 요청으로 이어져 사용자가 다시 입력하는 피로를 줄입니다.</p>
                      </div>
                    </section>
                  </aside>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
                  <button
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전 질문
                  </button>
                  <p className="text-[12px] leading-5 text-stone-400">
                    마지막 질문 뒤에는 추천 결과가 자동 생성됩니다.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center animate-fade-up">
                <div className="mb-4 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#ca604c] shadow-sm">
                  recommendation engine
                </div>
                <h3 className="balance text-[2rem] font-semibold leading-[1.05] text-stone-950" data-display="true">
                  예산과 고민에 맞는 조합을
                  <br />
                  정리하고 있어요
                </h3>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-stone-600">
                  우선 데이터베이스에서 예산과 고민에 맞는 후보를 좁힌 뒤, 그 후보를 바탕으로 근거가
                  읽히는 추천 결과를 정리합니다.
                </p>
              </div>
            )}

            {isComplete && result && (
              <div className="animate-fade-up space-y-5">
                <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                  <section className="rounded-[22px] border border-stone-200 bg-white px-5 py-5 sm:px-6">
                    <p className="eyebrow mb-3">recommendation result</p>
                    <h2 className="balance text-[2rem] font-semibold leading-[1.04] text-stone-950 sm:text-[2.35rem]" data-display="true">
                      {result.strategyTitle}
                    </h2>
                    <p className="mt-4 text-[14px] leading-7 text-stone-600">{result.summary}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          estimated total
                        </p>
                        <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                          {result.totalPrice}만원
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
                          quote ready
                        </p>
                        <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                          즉시 연결
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
                        {result.confidenceNotes.map((note) => (
                          <li key={note} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#ca604c]" />
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
                        추천 조합 세부 카드
                      </h3>
                    </div>
                    <span className="hidden text-[12px] text-stone-400 sm:inline">
                      모바일에서는 카드처럼 넘겨볼 수 있게 구성했습니다.
                    </span>
                  </div>

                  <div className="snap-strip xl:grid xl:grid-cols-2 xl:overflow-visible xl:px-0 xl:pb-0">
                    {result.items.map((item) => (
                      <article
                        key={item.name}
                        className="snap-card soft-panel flex h-full flex-col p-5 lg:w-auto"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                              {item.category}
                            </span>
                            <h4 className="mt-3 text-[1.15rem] font-semibold text-stone-950">{item.name}</h4>
                          </div>
                          <span className="text-[1.1rem] font-semibold text-[#ca604c]" data-display="true">
                            {item.price}만원
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
                            <p className="mt-2 text-[13px] leading-6 text-stone-700">
                              {item.synergy || "단독 진행 가능"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-[13px] leading-6 text-stone-500">
                          <span className="font-semibold text-stone-700">주의사항</span> {item.sideEffects}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row">
                  <button onClick={handleRestart} className="action-secondary text-center">
                    조건 다시 고르기
                  </button>
                  <Link href={getRequestHref(result, answers)} className="action-primary text-center">
                    이 추천으로 견적 요청하기
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
