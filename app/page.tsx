"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { treatmentCategories } from "../lib/siteContent";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./components/LanguageProvider";

const steps = [
  {
    label: "01",
    title: "정보 입력",
    body: "고민, 예산, 나이대, 원하는 결과, 회복 가능 시간을 짧게 입력합니다.",
  },
  {
    label: "02",
    title: "AI 맞춤 추천",
    body: "입력한 조건을 바탕으로 필요한 시술 후보와 가격대를 좁혀줍니다.",
  },
  {
    label: "03",
    title: "견적 요청",
    body: "병원이 바로 이해할 수 있는 요청서로 바꿔 반복 상담을 줄입니다.",
  },
  {
    label: "04",
    title: "병원 역제안",
    body: "병원은 고객에게 맞는 시술 조합과 예약 안내를 제안합니다.",
  },
];

const audiences = [
  {
    title: "시술이 처음인 고객",
    body: "시술명을 몰라도 고민과 예산에서 시작해 필요한 정보와 병원 제안을 받을 수 있습니다.",
    href: "/recommend",
    cta: "추천 받아보기",
    tone: "yellow",
  },
  {
    title: "고객을 선별하고 싶은 병원",
    body: "상담 전에 고객의 고민, 예산, 지역, 원하는 결과를 먼저 확인하고 맞는 고객에게만 제안합니다.",
    href: "/hospital",
    cta: "요청 보드 보기",
    tone: "violet",
  },
  {
    title: "한국 시술을 찾는 해외 고객",
    body: "영어, 중국어, 일본어, 태국어 상담 흐름으로 글로벌 환자 연결까지 확장합니다.",
    href: "/request",
    cta: "견적 요청하기",
    tone: "porcelain",
  },
];

const metrics = [
  { label: "개인화 추천", value: "5단계", body: "고민, 예산, 나이대, 목표, 다운타임 기준" },
  { label: "시술 카테고리", value: `${treatmentCategories.length}개`, body: "리프팅부터 제모, 항노화 관리까지" },
  { label: "병원 연결", value: "역제안", body: "추천 이유, 시술 조합, 예약 안내 비교" },
];

const clinicBenefits = [
  "상담 전 고객 고민과 예산을 먼저 확인",
  "핏이 맞는 고객에게만 시술 조합 제안",
  "국내외 신규 고객 유입과 재방문 관리",
];

const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "";

export default function Home() {
  const { t } = useLanguage();
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
      alert(`로그인에 실패했어요. ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleKakaoChannelOpen = () => {
    if (!kakaoChannelUrl) {
      alert("카카오 채널 URL이 아직 연결되지 않았어요. Vercel 환경변수 NEXT_PUBLIC_KAKAO_CHANNEL_URL에 채널 링크를 넣으면 바로 연결됩니다.");
    }
  };

  return (
    <div className="pb-12">
      <header className="sticky top-4 z-30">
        <div className="shell">
          <div className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 rounded-full border border-[rgba(23,21,14,0.08)] bg-white/88 px-4 py-2 backdrop-blur">
            <Link href="/" className="flex items-center gap-3 rounded-full px-2 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-carbon)] text-[13px] font-semibold text-white">
                T
              </span>
              <span className="text-[20px] font-semibold tracking-[-0.06em]" data-display="true">
                Tangle
              </span>
            </Link>

            <nav className="flex flex-wrap items-center justify-end gap-1">
              <Link href="/recommend" className="ghost-link">
                {t("nav.recommend")}
              </Link>
              <Link href="/request" className="ghost-link">
                {t("nav.request")}
              </Link>
              <Link href="/hospital" className="ghost-link">
                {t("nav.hospital")}
              </Link>
              {kakaoChannelUrl ? (
                <a href={kakaoChannelUrl} target="_blank" rel="noreferrer" className="ghost-link">
                  {t("nav.kakao")}
                </a>
              ) : (
                <button onClick={handleKakaoChannelOpen} className="ghost-link">
                  {t("nav.kakao")}
                </button>
              )}
              <LanguageSwitcher />
              {userEmail ? (
                <>
                  <Link href={`/my?email=${encodeURIComponent(userEmail)}`} className="ghost-link">
                    {t("nav.my")}
                  </Link>
                  <button onClick={handleLogout} className="action-secondary !px-4 !py-2">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <button onClick={handleKakaoLogin} className="action-primary !px-5 !py-2.5">
                  {t("nav.login")}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="shell pt-10">
        <section className="overflow-hidden rounded-[44px] bg-white px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="max-w-[780px]">
              <p className="eyebrow">beauty connect infrastructure</p>
              <h1 className="type-title balance mt-7" data-display="true">
                나에게 가장 필요한
                <br />
                시술 정보안내와
                <br />
                병원 제안 받기
              </h1>
              <p className="mt-7 max-w-[680px] text-[17px] leading-8 text-[var(--color-muted)]">
                탱글은 시술 정보 탐색, 개인 맞춤 추천, 견적 요청, 병원 역제안을 하나의 흐름으로 연결,
                소비자의 선택피로도를 감소시키고 병원의 상담시간과 홍보비용을 줄이며 재방문율을 높입니다.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/recommend" className="action-primary">
                  추천 시작
                </Link>
                <Link href="/request" className="action-secondary">
                  견적 요청하기
                </Link>
              </div>
              <p className="mt-5 text-[13px] font-semibold text-[var(--color-muted)]">
                정보 탐색, 추천, 견적 요청, 병원 제안까지 이어주는 해결사
              </p>
            </div>

            <div className="relative min-h-[420px] overflow-hidden rounded-[40px] bg-[var(--color-porcelain-gray)] lg:min-h-[590px]">
              <Image
                src="/tangle-flow-studio.svg"
                alt="카메라로 얼굴을 업로드하고 고민 부위를 표시한 뒤 병원에게만 공개하는 탱글 기능 안내"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-[32px] bg-[var(--color-porcelain-gray)] p-6">
              <p className="text-[13px] font-semibold text-[var(--color-muted)]">{metric.label}</p>
              <p className="mt-5 text-[3rem] font-semibold leading-none tracking-[-0.06em]" data-display="true">
                {metric.value}
              </p>
              <p className="mt-4 text-[14px] leading-6 text-[var(--color-muted)]">{metric.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="eyebrow">decision board</p>
            <h2 className="type-section mt-6" data-display="true">
              시술이 처음이라도 안심하세요
            </h2>
            <p className="mx-auto mt-5 max-w-[640px] text-[16px] leading-8 text-[var(--color-muted)]">
              탱글이 신뢰를 바탕으로 꼭 필요한 곳으로 연결 시켜드립니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article key={step.label} className="rounded-[32px] bg-white p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-genius-yellow)] text-[13px] font-semibold">
                  {step.label}
                </span>
                <h3 className="mt-10 text-[1.65rem] font-semibold tracking-[-0.05em]" data-display="true">
                  {step.title}
                </h3>
                <p className="mt-4 text-[14px] leading-7 text-[var(--color-muted)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-3">
          {audiences.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group min-h-[340px] rounded-[40px] p-7 hover:-translate-y-1 ${
                card.tone === "yellow"
                  ? "bg-[var(--color-genius-yellow)]"
                  : card.tone === "violet"
                    ? "bg-[var(--color-sky-violet)]"
                    : "bg-[var(--color-porcelain-gray)]"
              }`}
            >
              <h3 className="text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.06em]" data-display="true">
                {card.title}
              </h3>
              <p className="mt-6 text-[15px] leading-7 text-[rgba(23,21,14,0.72)]">{card.body}</p>
              <p className="mt-12 inline-flex rounded-full bg-white px-5 py-3 text-[13px] font-semibold">
                {card.cta}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-16 rounded-[44px] bg-[var(--color-carbon)] p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/55">category index</p>
              <h2 className="type-section mt-6 !text-white" data-display="true">
                시술 카테고리
                <br />
                한눈에 보기
              </h2>
            </div>
            <p className="max-w-[620px] text-[15px] leading-8 text-white/68 lg:ml-auto">
              리프팅, 스킨부스터, 보톡스, 색소/레이저, 모공흉터, 제모처럼 사용자가 실제로 찾는 기준으로 정리했습니다.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {treatmentCategories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="rounded-[28px] bg-white/10 p-5 hover:bg-white hover:text-[var(--color-carbon)]"
              >
                <p className="text-[1.25rem] font-semibold tracking-[-0.04em]">{category.name}</p>
                <p className="mt-5 line-clamp-3 text-[14px] leading-6 opacity-75">{category.examples}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[44px] bg-white">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="eyebrow">clinic side</p>
              <h2 className="type-section mt-6" data-display="true">
                23조 시장,
                <br />
                국내외 소비자에게 신뢰를 확보하고 재방문을 유도하세요.
              </h2>
              <p className="mt-6 max-w-[720px] text-[16px] leading-8 text-[var(--color-muted)]">
                탱글은 상담 전 고객의 고민과 예산을 구조화해 병원의 반복 상담을 줄이고, 관심 고객에게 맞춤 제안을 보내는 새로운 유입 채널이 됩니다.
              </p>
            </div>

            <div className="grid gap-3 bg-[var(--color-porcelain-gray)] p-4 sm:grid-cols-3 lg:grid-cols-1">
              {clinicBenefits.map((benefit, index) => (
                <article key={benefit} className="rounded-[28px] bg-white p-5">
                  <p className="text-[12px] font-semibold text-[var(--color-muted-light)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-8 text-[1.35rem] font-semibold leading-tight tracking-[-0.05em]" data-display="true">
                    {benefit}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
