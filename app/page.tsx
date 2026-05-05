"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { accentStyles, treatmentCategories } from "../lib/siteContent";
import {
  priceEvidenceHighlights,
  priceEvidenceStats,
  treatmentExpansionSignals,
} from "../lib/priceEvidenceSummary";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./components/LanguageProvider";

const trustPillars = [
  {
    title: "컴팩트한 기본 정보",
    description: "처음 들어온 사용자도 시술명, 가격대, 회복, 조합 이유를 짧게 이해하고 요청서를 만들 수 있게 합니다.",
  },
  {
    title: "상담 전 자동 필터링",
    description: "병원은 고객의 고민과 예산을 먼저 보고, 맞는 고객에게만 제안해 상담 리소스를 줄입니다.",
  },
  {
    title: "역제안 기반 매칭",
    description: "환자가 요청을 올리면 병원이 추천 시술, 이유, 예약 안내를 제안해 양쪽의 핏을 빠르게 확인합니다.",
  },
];

const quickActions = [
  {
    title: "AI Recommendation",
    body: "신규 고객이 시술 정보를 이해하고, 과한 상담 없이 요청서를 만들 수 있게 돕습니다.",
    href: "/recommend",
    cta: "추천 시작",
    tone: "soft",
  },
  {
    title: "Request Quote",
    body: "환자는 오퍼를 넣고, 병원은 핏이 맞는 고객에게 추천 시술과 예약 안내를 역제안합니다.",
    href: "/request",
    cta: "견적 요청",
    tone: "accent",
  },
] as const;

const trustReasons = [
  {
    title: "정보비대칭을 줄이는 1차 상담",
    description: "시술명, 가격대, 회복 정보, 조합 근거를 컴팩트하게 먼저 제공해 상담 전 탐색 시간을 줄입니다.",
  },
  {
    title: "병원은 더 맞는 고객만 만납니다",
    description: "환자의 고민, 예산, 선호 지역을 미리 구조화해 상담실장의 반복 설명과 1차 필터링 부담을 낮춥니다.",
  },
  {
    title: "글로벌 연결까지 확장 가능한 구조",
    description: "국내 고객뿐 아니라 외국인 환자 유치까지 고려해, 언어와 상담 단계를 줄이는 연결 플랫폼으로 확장합니다.",
  },
];

const signalRows = [
  { label: "환자 입력", value: "5단계", hint: "고민, 예산, 목표, 회복 조건을 짧게 정리" },
  { label: "병원 제안", value: "역제안", hint: "핏이 맞는 병원이 시술과 예약 안내를 제안" },
  { label: "확장 방향", value: "Global", hint: "외국인 환자 연결과 다국어 상담까지 확장" },
];

const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "";

export default function Home() {
  const { language, t } = useLanguage();
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

  const handleKakaoChannelOpen = () => {
    if (!kakaoChannelUrl) {
      alert("카카오 채널 URL이 아직 연결되지 않았어요. NEXT_PUBLIC_KAKAO_CHANNEL_URL에 채널 링크를 넣으면 바로 연결됩니다.");
    }
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
                  <p className="eyebrow mb-2">beauty connect platform</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[1.32rem] font-semibold text-stone-950 sm:text-[1.5rem]" data-display="true">
                      Tangle
                    </h1>
                    <span className="rounded-full border border-[#ded4f4] bg-[#f4efff] px-2.5 py-1 text-[11px] font-medium text-[#6947b6]">
                      {t("home.badge")}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-stone-500 sm:text-[14px]">
                    {t("home.subhead")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/recommend" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                {t("nav.recommend")}
              </Link>
              <Link href="/request" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                {t("nav.request")}
              </Link>
              <Link href="/hospital" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
                {t("nav.hospital")}
              </Link>
              {kakaoChannelUrl ? (
                <a
                  href={kakaoChannelUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm"
                >
                  {t("nav.kakao")}
                </a>
              ) : (
                <button
                  onClick={handleKakaoChannelOpen}
                  className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm"
                >
                  {t("nav.kakao")}
                </button>
              )}
              <LanguageSwitcher />
              {userEmail ? (
                <>
                  <Link
                    href={`/my${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`}
                    className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm"
                  >
                    {t("nav.my")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="action-primary !rounded-full !px-4 !py-2.5 !text-sm"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleKakaoLogin}
                  className="rounded-full bg-[#FEE500] px-4 py-2.5 text-sm font-bold text-[#3c1e1e] shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                >
                  {t("nav.login")}
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
                  {t("home.heroBadge")}
                </span>
                <h2
                  className="balance mt-4 text-[2.35rem] font-semibold leading-[0.98] text-stone-950 sm:text-[3.2rem]"
                  data-display="true"
                >
                  {t("home.heroTitle")
                    .split("\n")
                    .map((line) => (
                      <span key={`${language}-${line}`} className="block">
                        {line}
                      </span>
                    ))}
                </h2>
                <p className="mt-4 max-w-xl text-[14px] leading-7 text-stone-600 sm:text-[15px]">
                  {t("home.heroBody")}
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/recommend" className="action-primary text-center">
                    {t("home.primaryCta")}
                  </Link>
                  <Link href="/request" className="action-secondary text-center">
                    {t("home.secondaryCta")}
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
                      web first prototype
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-[#221a33] p-4 text-white shadow-[0_16px_36px_rgba(34,26,51,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      smart consult
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        "환자의 고민과 예산을 구조화",
                        "불필요한 상담 전 시술 후보 정리",
                        "핏이 맞는 병원의 역제안으로 연결",
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
                        market role
                      </p>
                      <p className="mt-2 text-[1.1rem] font-semibold text-stone-950">환자-병원 연결</p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-500">신규 고객 유입과 병원 제안 흐름을 통합</p>
                    </div>
                    <div className="rounded-[20px] border border-[#ece5ff] bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        operation fit
                      </p>
                      <p className="mt-2 text-[1.1rem] font-semibold text-stone-950">상담 업무 절감</p>
                      <p className="mt-2 text-[12px] leading-5 text-stone-500">기본 정보 안내와 1차 필터링을 플랫폼이 담당</p>
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
              <p className="eyebrow mb-3">market evidence</p>
              <h3 className="type-section" data-display="true">
                가격표를 쌓을수록
                <br />
                추천은 더 구체적이 됩니다
              </h3>
              <p className="mt-3 text-[13px] leading-6 text-stone-600">
                공개 가격표와 이벤트 이미지를 시술·패키지 단위로 나눠 저장하고, 추천 결과의 가격 신뢰도를
                높이는 근거 레이어로 사용합니다.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {priceEvidenceStats.map((stat) => (
                  <div key={stat.label} className="rounded-[18px] border border-[#ece5ff] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-[1.15rem] font-semibold text-stone-950" data-display="true">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-stone-500">{stat.hint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {priceEvidenceHighlights.map((item) => (
                  <article key={item.title} className="rounded-[18px] bg-[#221a33] px-4 py-4 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-[14px] font-semibold">{item.title}</h4>
                      <span className="shrink-0 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-[#d9c8ff]">
                        {item.range}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-white/72">{item.body}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {treatmentExpansionSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-[#e3daf7] bg-[#f7f2ff] px-3 py-1.5 text-[11px] font-medium text-[#6b38d4]"
                  >
                    {signal}
                  </span>
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
                사람이 반복하던 일을
                <br />
                플랫폼이 먼저 줄입니다
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
