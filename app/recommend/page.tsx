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
    title: "가장 먼저 해결하고 싶은 고민은 무엇인가요?",
    subtitle: "탱글은 막연한 검색 대신 가장 큰 고민 하나를 기준으로 추천 방향을 잡습니다.",
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
    title: "현재 연령대는 어디에 가까운가요?",
    subtitle: "연령대는 기대 변화 폭과 유지형 시술 비중을 조정하는 데 참고합니다.",
    options: [
      { label: "20대", value: "20대", hint: "과한 시술보다 입문형 조합 우선" },
      { label: "30대", value: "30대", hint: "예방과 개선의 균형" },
      { label: "40대", value: "40대", hint: "체감 변화와 유지 전략을 함께 고려" },
      { label: "50대 이상", value: "50대 이상", hint: "효율 높은 메인 시술 우선" },
    ],
  },
  {
    key: "goal",
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
  "추천 결과에 회복/주의사항 함께 표기",
  "견적 요청서로 바로 이어지는 흐름",
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
    <div className="pb-16 pt-5 sm:pt-7">
      <div className="shell">
        <nav className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            ← 홈으로
          </Link>
          <button
            onClick={handleRestart}
            className="text-sm font-semibold text-stone-400 hover:text-stone-700"
          >
            처음부터 다시
          </button>
        </nav>

        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="panel h-fit px-6 py-7 sm:px-7">
            <p className="eyebrow mb-3">recommendation briefing</p>
            <h1 className="text-3xl font-bold text-stone-950" data-display="true">
              신뢰 가능한 추천을 만드는 질문
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              단순히 “뭐가 좋아요?”를 묻는 대신, 예산과 회복 허용도까지 포함해 추천의 현실성을
              높입니다.
            </p>

            <div className="mt-6 rounded-[24px] border border-stone-200 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                체크하는 기준
              </p>
              <ul className="mt-3 space-y-3 text-sm text-stone-600">
                {trustLabels.map((label) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#d4634e]" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              {questions.map((question, index) => {
                const isActive = index === stepIndex && !loading && !isComplete;
                const isAnswered = Boolean(answers[question.key]);
                return (
                  <div
                    key={question.key}
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      isActive
                        ? "border-stone-900 bg-stone-900 text-white"
                        : isAnswered
                          ? "border-stone-200 bg-white text-stone-700"
                          : "border-stone-200/70 bg-white/50 text-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{index + 1}. {question.title}</span>
                      {isAnswered && !isActive && <span className="text-xs">완료</span>}
                    </div>
                    {answers[question.key] && (
                      <p className={`mt-2 text-xs ${isActive ? "text-white/75" : "text-stone-500"}`}>
                        {answers[question.key]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <main className="panel min-h-[620px] px-6 py-7 sm:px-8">
            {!loading && !isComplete && activeQuestion && (
              <div className="animate-fade-up">
                <div className="mb-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="eyebrow">step {stepIndex + 1}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-stone-900"
                        style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-stone-950" data-display="true">
                    {activeQuestion.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{activeQuestion.subtitle}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {activeQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`question-option ${
                        answers[activeQuestion.key] === option.value ? "question-option-active" : ""
                      }`}
                    >
                      <span className="block text-lg font-bold text-stone-900">{option.label}</span>
                      <span className="mt-2 block text-sm leading-6 text-stone-500">{option.hint}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                    className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전 질문
                  </button>
                  <p className="text-sm text-stone-400">
                    추천은 마지막 질문 후 자동으로 생성됩니다.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center animate-fade-up">
                <div className="mb-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#d4634e] shadow-sm">
                  추천 로직 실행 중
                </div>
                <h3 className="text-3xl font-bold text-stone-950" data-display="true">
                  예산과 고민에 맞는 조합을 정리하고 있어요
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
                  탱글은 우선 데이터베이스에서 예산과 고민에 맞는 시술 후보를 좁힌 뒤, 그 후보를
                  바탕으로 설명 가능한 추천 결과를 정리합니다.
                </p>
              </div>
            )}

            {isComplete && result && (
              <div className="animate-fade-up">
                <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow mb-3">recommendation result</p>
                    <h2 className="text-4xl font-bold text-stone-950" data-display="true">
                      {result.strategyTitle}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">{result.summary}</p>
                  </div>
                  <div className="rounded-[24px] bg-stone-900 px-5 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">estimated total</p>
                    <p className="mt-2 text-3xl font-bold" data-display="true">
                      {result.totalPrice}만원
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <section className="space-y-4">
                    <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                      <h3 className="text-lg font-bold text-stone-900">왜 이 조합이 맞는가</h3>
                      <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                        {result.confidenceNotes.map((note) => (
                          <li key={note} className="flex gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#d4634e]" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-[24px] border border-stone-200 bg-white p-5">
                      <h3 className="text-lg font-bold text-stone-900">예산 적합성</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{result.budgetFit}</p>
                    </div>

                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                      <h3 className="text-lg font-bold text-stone-900">상담 전에 꼭 확인할 점</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-700">{result.caution}</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    {result.items.map((item) => (
                      <article key={item.name} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                              {item.category}
                            </span>
                            <h3 className="mt-3 text-2xl font-bold text-stone-900">{item.name}</h3>
                          </div>
                          <span className="text-xl font-bold text-[#d4634e]">{item.price}만원</span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-stone-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">추천 이유</p>
                            <p className="mt-2 text-sm font-medium text-stone-700">{item.reason}</p>
                          </div>
                          <div className="rounded-2xl bg-stone-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">회복</p>
                            <p className="mt-2 text-sm font-medium text-stone-700">{item.recovery}</p>
                          </div>
                          <div className="rounded-2xl bg-stone-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-stone-400">시너지</p>
                            <p className="mt-2 text-sm font-medium text-stone-700">{item.synergy || "단독 진행 가능"}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-stone-500">
                          <span className="font-semibold text-stone-700">주의사항</span> {item.sideEffects}
                        </p>
                      </article>
                    ))}
                  </section>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleRestart}
                    className="rounded-[20px] border border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-900 hover:border-stone-300 hover:shadow-md"
                  >
                    조건 다시 고르기
                  </button>
                  <Link
                    href={getRequestHref(result, answers)}
                    className="rounded-[20px] bg-stone-900 px-6 py-4 text-center text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-stone-800"
                  >
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
