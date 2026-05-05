"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { treatmentCategories } from "../lib/siteContent";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./components/LanguageProvider";

const marketLoop = [
  {
    label: "01",
    title: "사용자 입력",
    body: "고민, 예산, 나이대, 선호 지역, 회복 가능 시간을 짧은 문항으로 구조화합니다.",
  },
  {
    label: "02",
    title: "AI 판단 보드",
    body: "시술 후보, 가격대, 회복 기간, 주의사항을 한 화면에서 비교 가능한 형태로 정리합니다.",
  },
  {
    label: "03",
    title: "견적 요청",
    body: "사용자는 길게 설명하지 않아도 병원이 이해할 수 있는 요청서를 만들 수 있습니다.",
  },
  {
    label: "04",
    title: "병원 역제안",
    body: "병원은 핏이 맞는 고객에게 시술 조합, 가격, 예약 안내를 제안합니다.",
  },
];

const decisionSignals = [
  {
    label: "시장 문제",
    value: "정보 피로",
    body: "후기와 광고가 섞인 시장에서 사용자는 무엇을 믿어야 할지부터 막힙니다.",
  },
  {
    label: "사용자 가치",
    value: "빠른 판단",
    body: "시술 탐색, 예산 확인, 병원 문의를 하나의 흐름으로 압축합니다.",
  },
  {
    label: "병원 가치",
    value: "1차 필터링",
    body: "반복 상담 전에 고객의 고민과 예산을 먼저 확인합니다.",
  },
  {
    label: "확장 방향",
    value: "Global",
    body: "영어, 중국어, 일본어, 태국어 상담 흐름으로 확장합니다.",
  },
];

const valueCards = [
  {
    title: "소비자는 덜 헤맵니다",
    body: "시술명을 몰라도 고민과 예산만 입력하면 후보와 다음 행동이 정리됩니다.",
    href: "/recommend",
    cta: "추천 시작",
  },
  {
    title: "병원은 맞는 고객만 봅니다",
    body: "요청서를 보고 핏이 맞는 고객에게 시술 조합과 예약 안내를 제안합니다.",
    href: "/hospital",
    cta: "병원센터 보기",
  },
  {
    title: "외국인 고객도 연결합니다",
    body: "다국어 상담과 요청서 구조를 기반으로 글로벌 환자 유치 흐름까지 확장합니다.",
    href: "/request",
    cta: "견적 요청",
  },
];

const clinicCards = [
  {
    title: "신규 고객 유입",
    body: "시술을 잘 아는 헤비유저뿐 아니라 처음 들어오는 고객도 병원과 연결될 수 있게 만듭니다.",
  },
  {
    title: "상담 리소스 절감",
    body: "고객 고민과 예산을 먼저 확인하고, 맞는 고객에게만 구체적인 제안을 보냅니다.",
  },
  {
    title: "가격만이 아닌 제안",
    body: "최저가 경쟁이 아니라 추천 이유, 조합, 예약 안내까지 포함한 제안으로 비교합니다.",
  },
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
    <div className="pb-10">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-fog-canvas)]/92 backdrop-blur">
        <div className="shell flex min-h-[64px] flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-[24px] font-semibold uppercase tracking-[-0.08em]" data-display="true">
              Tangle
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)] sm:inline">
              beauty connect
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-3">
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
                <button onClick={handleLogout} className="action-primary !px-4 !py-2">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <button onClick={handleKakaoLogin} className="action-primary !px-4 !py-2">
                {t("nav.login")}
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="shell">
        <section className="grid min-h-[calc(100vh-64px)] border-x border-b border-[var(--color-carbon)] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-between border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <div>
              <p className="eyebrow">{t("home.eyebrow")}</p>
              <h1 className="type-title balance mt-8 max-w-[850px]" data-display="true">
                {t("home.heroTitle")
                  .split("\n")
                  .map((line) => (
                    <span key={`${language}-${line}`} className="block">
                      {line}
                    </span>
                  ))}
              </h1>
              <p className="mt-7 max-w-[650px] text-[16px] leading-8 text-[var(--color-muted)] sm:text-[18px]">
                {t("home.heroBody")}
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-[auto_auto_1fr] md:items-center">
              <Link href="/recommend" className="action-primary">
                {t("home.primaryCta")}
              </Link>
              <Link href="/request" className="action-secondary">
                {t("home.secondaryCta")}
              </Link>
              <p className="text-[12px] leading-6 text-[var(--color-muted)] md:text-right">
                정보 탐색, 추천, 견적 요청, 병원 제안까지 이어지는 프로토타입입니다.
              </p>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <div className="tangle-image-frame relative flex min-h-[520px] items-end overflow-hidden">
              <Image
                src="/tangle-skin-canvas.svg"
                alt="피부 상태와 상담 흐름을 추상화한 탱글 비주얼"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute left-5 top-5 border border-[var(--color-carbon)] bg-[var(--color-fog-canvas)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">consult canvas</p>
                <p className="mt-2 text-[15px] font-semibold">피부 고민을 요청서로 변환</p>
              </div>
            </div>

            <div className="grid border-t border-[var(--color-carbon)] sm:grid-cols-4">
              {decisionSignals.map((signal) => (
                <article
                  key={signal.label}
                  className="border-b border-[var(--color-line)] p-4 sm:border-b-0 sm:border-r last:sm:border-r-0"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{signal.label}</p>
                  <h2 className="mt-3 text-[1.35rem] font-semibold leading-tight" data-display="true">
                    {signal.value}
                  </h2>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--color-muted)]">{signal.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">decision board</p>
            <h2 className="type-section mt-6" data-display="true">
              스크롤형 정보 모음이 아니라
              <br />
              한 번에 읽히는 판단 보드
            </h2>
            <p className="mt-5 type-copy">
              탱글의 핵심은 더 많은 정보를 던지는 것이 아니라, 처음 시술을 알아보는 사람이 바로 비교할 수 있게 정보를 줄이고 배치하는 것입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2">
            {marketLoop.map((item) => (
              <article
                key={item.label}
                className="min-h-[220px] border-b border-[var(--color-line)] p-5 sm:p-7 md:border-r even:md:border-r-0"
              >
                <p className="text-[12px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{item.label}</p>
                <h3 className="mt-8 text-[2rem] font-normal leading-none" data-display="true">
                  {item.title}
                </h3>
                <p className="mt-4 text-[14px] leading-7 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-x border-b border-[var(--color-carbon)]">
          <div className="flex flex-col justify-between gap-6 border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">category index</p>
              <h2 className="type-section mt-6" data-display="true">
                시술 카테고리 한눈에 보기
              </h2>
            </div>
            <Link href="/recommend" className="ghost-link">
              추천 플로우로 이동
            </Link>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {treatmentCategories.map((category, index) => (
              <Link
                key={category.name}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="group min-h-[300px] border-b border-[var(--color-line)] p-5 hover:bg-[var(--color-carbon)] hover:text-[var(--color-ghost-white)] md:border-r md:even:border-r-0 xl:[&:nth-child(even)]:border-r xl:[&:nth-child(4n)]:border-r-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[12px] uppercase tracking-[0.22em] text-[var(--color-muted-light)] group-hover:text-[var(--color-ghost-white)]/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="border border-current px-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                    {category.name}
                  </span>
                </div>
                <h3 className="mt-12 text-[1.45rem] font-normal leading-tight" data-display="true">
                  {category.headline}
                </h3>
                <p className="mt-5 text-[13px] leading-6 text-[var(--color-muted)] group-hover:text-[var(--color-ghost-white)]/72">
                  {category.examples}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-x border-b border-[var(--color-carbon)]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8">
            <p className="eyebrow">what you can do</p>
            <h2 className="type-section mt-6" data-display="true">
              들어오자마자 할 일이 보여야 합니다
            </h2>
          </div>

          <div className="grid lg:grid-cols-3">
            {valueCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group min-h-[300px] border-b border-[var(--color-line)] p-5 hover:bg-[var(--color-carbon)] hover:text-[var(--color-ghost-white)] sm:p-7 lg:border-r lg:last:border-r-0"
              >
                <h3 className="text-[2rem] font-normal leading-tight" data-display="true">
                  {card.title}
                </h3>
                <p className="mt-6 text-[14px] leading-7 text-[var(--color-muted)] group-hover:text-[var(--color-ghost-white)]/72">
                  {card.body}
                </p>
                <p className="mt-10 text-[12px] uppercase tracking-[0.18em]">{card.cta}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">clinic side</p>
            <h2 className="type-section mt-6" data-display="true">
              병원은 더 많은 문의가 아니라
              <br />
              더 맞는 고객을 만납니다
            </h2>
            <p className="mt-5 max-w-[720px] type-copy">
              탱글은 상담실장의 반복 설명을 줄이고, 병원이 실제로 응대할 가치가 있는 요청을 먼저 보여주는 방향으로 설계됩니다. 최종 버전에서는 병원 계정과 관리자만 병원 센터에 접근하도록 권한을 분리합니다.
            </p>
          </div>

          <div className="grid">
            {clinicCards.map((item) => (
              <article key={item.title} className="border-b border-[var(--color-line)] p-5 sm:p-7 last:border-b-0">
                <h3 className="text-[1.45rem] font-normal" data-display="true">
                  {item.title}
                </h3>
                <p className="mt-4 text-[14px] leading-7 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
