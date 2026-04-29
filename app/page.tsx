"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { accentStyles, treatmentCategories } from "../lib/siteContent";

const trustPillars = [
  {
    title: "팩트 기반 가격대",
    description: "실제 시술 데이터의 가격 범위를 먼저 보여주고, 예산을 벗어나는 조합은 초반부터 걸러냅니다.",
  },
  {
    title: "설명 가능한 추천",
    description: "고민, 예산, 연령대, 다운타임 조건을 함께 받아 추천 이유와 주의 포인트까지 정리합니다.",
  },
  {
    title: "병원 제안 비교",
    description: "가격만이 아니라 추천 시술, 설명, 예약 안내를 한 화면에서 비교하는 구조를 지향합니다.",
  },
];

const quickActions = [
  {
    title: "AI Recommendation",
    body: "예산과 고민에 맞춘 시술 조합을 먼저 받고, 회복과 총액까지 한 번에 확인합니다.",
    href: "/recommend",
    cta: "추천 시작",
    tone: "soft",
  },
  {
    title: "Request Quote",
    body: "추천 결과를 바탕으로 병원 제안을 받고, 가격과 예약 안내를 비교해 바로 다음 단계로 넘어갑니다.",
    href: "/request",
    cta: "견적 요청",
    tone: "accent",
  },
] as const;

const trustReasons = [
  {
    title: "데이터 기반 인사이트",
    description: "후기 감상보다 가격대, 회복 정보, 조합 근거를 우선 보여주어 불필요한 시술을 줄입니다.",
  },
  {
    title: "투명한 비교 구조",
    description: "추천 결과와 병원 제안을 같은 흐름 안에 두어 사용자가 혼자 계산하지 않아도 되게 만듭니다.",
  },
  {
    title: "모바일 우선 경험",
    description: "폰에서 빠르게 읽히는 카드 구조로 설계해 상담 전 단계에서 판단 피로를 낮춥니다.",
  },
];

const signalRows = [
  { label: "질문 수", value: "5단계", hint: "고민, 예산, 목표, 다운타임을 짧게 정리" },
  { label: "결과 흐름", value: "추천 후 즉시", hint: "추천 조합을 견적 요청으로 바로 연결" },
  { label: "비교 기준", value: "3축", hint: "가격, 추천 이유, 예약 안내를 나란히 확인" },
];

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(`로그인에 실패했어요: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="pb-12 pt-4 sm:pt-5">
      <header className="shell mb-4">
        <div className="panel px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#221a33] text-sm font-semibold text-white shadow-[0_14px_32px_rgba(34,26,51,0.18)]">
                  TG
                </div>
                <div>
                  <p className="eyebrow mb-2">beauty decision platform</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[1.32rem] font-semibold text-stone-950 sm:text-[1.5rem]" data-display="true">
                      Tangle
                    </h1>
                    <span className="rounded-full border border-[#ded4f4] bg-[#f4efff] px-2.5 py-1 text-[11px] font-medium text-[#6947b6]">
                      개인 맞춤형 시술 추천
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-stone-500 sm:text-[14px]">
                    추천, 견적 비교, 병원 제안을 한 흐름으로 연결하는 스마트 뷰티 의사결정 플랫폼
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/recommend" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                AI 추천
              </Link>
              <Link href="/request" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                견적 요청
              </Link>
              <Link href="/hospital" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                병원 센터
              </Link>
              {userEmail ? (
                <>
                  <Link
                    href={`/my${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`}
                    className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm"
                  >
                    받은 제안함
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="action-primary !rounded-full !px-4 !py-2.5 !text-sm"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <button
                  onClick={handleKakaoLogin}
                  className="rounded-full bg-[#FEE500] px-4 py-2.5 text-sm font-bold text-[#3c1e1e] shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                >
                  카카오로 시작하기
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="shell space-y-4">
        <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="panel overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
              <div className="flex flex-col">
                <span className="inline-flex w-fit rounded-full border border-[#eadfff] bg-[#f6f0ff] px-3 py-1 text-[11px] font-semibold text-[#6b38d4]">
                  Tangle: 탱글
                </span>
                <h2
                  className="balance mt-4 text-[2.35rem] font-semibold leading-[0.98] text-stone-950 sm:text-[3.2rem]"
                  data-display="true"
                >
                  가격만 보지 말고,
                  <br />
                  나에게 맞는 시술을
                  <br />
                  고르세요
                </h2>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-stone-600 sm:text-[15px]">
                  탱글은 예산, 고민, 회복 가능 시간까지 함께 고려해 시술 추천과 견적 비교를 정리하는 모바일
                  퍼스트 뷰티 플랫폼입니다.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/recommend" className="action-primary text-center">
                    추천 시작하기
                  </Link>
                  <Link href="/request" className="action-secondary text-center">
                    가격 먼저 보기
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {signalRows.map((signal) => (
                    <article key={signal.label} className="metric-tile">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        {signal.label}
                      </p>
                      <p className="mt-2 text-[1.35rem] font-semibold text-stone-950" data-display="true">
                        {signal.value}
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-500">{signal.hint}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <article className="rounded-[28px] border border-[#e7defa] bg-[linear-gradient(160deg,#ffffff_0%,#f7f1ff_55%,#f3edff_100%)] p-4 shadow-[0_22px_48px_rgba(107,56,212,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b6aa9]">
                      product snapshot
                    </span>
                    <span className="rounded-full border border-[#e0d5f7] bg-white/90 px-3 py-1 text-[11px] font-medium text-[#6b38d4]">
                      mobile first
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-[#221a33] p-4 text-white shadow-[0_16px_36px_rgba(34,26,51,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      smart consult
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        "고민을 질문 카드로 짧게 정리",
                        "추천 조합과 예상 총액을 즉시 확인",
                        "병원 제안을 비교하고 다음 단계로 이동",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-white/10 px-4 py-3"
                        >
                          <span className="text-[13px] font-medium text-white">{item}</span>
                          <span className="h-2.5 w-2.5 rounded-full bg-[#cdb6ff]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-[#ece5ff] bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        price scope
                      </p>
                      <p className="mt-2 text-[1.1rem] font-semibold text-stone-950">80~180만원</p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-500">예산대별 조합을 먼저 좁혀주는 구조</p>
                    </div>
                    <div className="rounded-[20px] border border-[#ece5ff] bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        treatment fit
                      </p>
                      <p className="mt-2 text-[1.1rem] font-semibold text-stone-950">설명 가능한 추천</p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-500">추천 이유와 회복 정보를 함께 제시</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={
                  action.tone === "accent"
                    ? "block rounded-[26px] bg-[linear-gradient(155deg,#6b38d4_0%,#7d4aea_100%)] px-5 py-5 text-white shadow-[0_18px_42px_rgba(107,56,212,0.24)] hover:-translate-y-0.5"
                    : "panel block px-5 py-5 hover:-translate-y-0.5"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={
                        action.tone === "accent"
                          ? "text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60"
                          : "text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400"
                      }
                    >
                      quick action
                    </p>
                    <h3
                      className={`mt-3 text-[1.65rem] font-semibold leading-[1.02] ${
                        action.tone === "accent" ? "text-white" : "text-stone-950"
                      }`}
                      data-display="true"
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`mt-3 text-[13px] leading-6 ${
                        action.tone === "accent" ? "text-white/80" : "text-stone-600"
                      }`}
                    >
                      {action.body}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      action.tone === "accent"
                        ? "border border-white/20 bg-white/10 text-white"
                        : "border border-[#e2d7fa] bg-[#f5efff] text-[#6b38d4]"
                    }`}
                  >
                    {action.cta}
                  </span>
                </div>
              </Link>
            ))}

            <section className="panel overflow-hidden px-5 py-5">
              <p className="eyebrow mb-3">treatment gallery</p>
              <h3 className="type-section" data-display="true">
                시술 후 어떤 인상이 될지
                <br />
                미리 상상하는 구간
              </h3>
              <p className="mt-3 text-[13px] leading-6 text-stone-600">
                향후에는 얼굴 업로드와 시뮬레이션 기능까지 연결해, 추천과 이미지를 같은 흐름 안에서 확인할 수
                있게 확장합니다.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  "from-[#f4ddd8] to-[#fff4ef]",
                  "from-[#efdffb] to-[#faf5ff]",
                  "from-[#fdebdc] to-[#fff8f2]",
                  "from-[#eadffd] to-[#f5efff]",
                ].map((gradient, index) => (
                  <div
                    key={gradient}
                    className={`aspect-[1.08/1] rounded-[18px] bg-gradient-to-br ${gradient} p-3`}
                  >
                    <div className="h-full rounded-[15px] border border-white/70 bg-white/50" />
                    <span className="mt-2 block text-[11px] font-medium text-stone-500">sample 0{index + 1}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="panel px-5 py-5 sm:px-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-3">category scan</p>
                <h3 className="type-section" data-display="true">
                  시술 카테고리 한눈에 보기
                </h3>
              </div>
              <Link href="/recommend" className="text-[13px] font-semibold text-stone-500 hover:text-stone-950">
                추천 플로우로 이동
              </Link>
            </div>

            <div className="mt-4 snap-strip lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-3">
              {treatmentCategories.map((category) => {
                const accent = accentStyles[category.accent];
                return (
                  <Link
                    key={category.name}
                    href={`/category/${encodeURIComponent(category.name)}`}
                    className="snap-card soft-panel flex h-full flex-col justify-between p-4 hover:-translate-y-0.5 hover:shadow-md lg:w-auto"
                  >
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${accent.chip}`}>
                        {category.name}
                      </span>
                      <h4 className="mt-3 text-[1rem] font-semibold leading-6 text-stone-950">{category.headline}</h4>
                      <p className="mt-2 text-[13px] leading-6 text-stone-600">{category.description}</p>
                    </div>

                    <div className="mt-4 space-y-2 text-[12px] leading-6 text-stone-500">
                      <p>
                        <span className="font-semibold text-stone-900">대표 시술</span> {category.examples}
                      </p>
                      <p>
                        <span className="font-semibold text-stone-900">추천 대상</span> {category.audience}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <section className="panel px-5 py-5 sm:px-6">
              <p className="eyebrow mb-3">why trust tangle</p>
              <h3 className="type-section" data-display="true">
                믿을 만한 추천이 되려면
                <br />
                무엇이 먼저 보여야 할까
              </h3>

              <div className="mt-4 space-y-3">
                {trustReasons.map((item, index) => (
                  <article key={item.title} className="soft-panel flex gap-4 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e9ff] text-[12px] font-semibold text-[#6b38d4]">
                      0{index + 1}
                    </span>
                    <div>
                      <h4 className="text-[15px] font-semibold text-stone-950">{item.title}</h4>
                      <p className="mt-2 text-[13px] leading-6 text-stone-600">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel px-5 py-5 sm:px-6">
              <p className="eyebrow mb-3">core value</p>
              <div className="grid gap-3">
                {trustPillars.map((pillar) => (
                  <article key={pillar.title} className="rounded-[20px] border border-[#ece5ff] bg-white px-4 py-4">
                    <h4 className="text-[15px] font-semibold text-stone-950">{pillar.title}</h4>
                    <p className="mt-2 text-[13px] leading-6 text-stone-600">{pillar.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
