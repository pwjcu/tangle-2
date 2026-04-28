"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { accentStyles, treatmentCategories } from "../lib/siteContent";

const trustPillars = [
  {
    title: "팩트 기반 가격대",
    description: "시술별 가격 범위와 예상 총액을 먼저 보여줘 과한 추천을 초기에 걸러냅니다.",
  },
  {
    title: "설명 가능한 추천",
    description: "고민, 예산, 연령대, 다운타임 허용도까지 받아 결과의 이유를 같이 정리합니다.",
  },
  {
    title: "역입찰형 병원 제안",
    description: "가격만이 아니라 추천 시술, 이유, 예약 안내까지 남는 구조로 비교를 돕습니다.",
  },
];

const decisionSignals = [
  {
    label: "질문 구조",
    value: "5단계",
    detail: "예산, 고민, 회복 부담까지 한 번에 정리",
  },
  {
    label: "추천 이후",
    value: "즉시 연결",
    detail: "추천 조합을 그대로 견적 요청서로 전달",
  },
  {
    label: "비교 방식",
    value: "3축",
    detail: "가격, 추천 이유, 예약 안내를 함께 확인",
  },
];

const flowSteps = [
  {
    step: "01",
    title: "고민을 구조화",
    body: "탄력, 색소, 모공처럼 흩어진 고민을 한 문장으로 정리하고 예산 범위를 먼저 확정합니다.",
  },
  {
    step: "02",
    title: "근거 있는 추천 확인",
    body: "추천 결과는 총액, 회복 정보, 주의사항, 시술 역할까지 한 화면에서 읽히게 만듭니다.",
  },
  {
    step: "03",
    title: "병원 제안 비교",
    body: "병원이 어떤 조합을 왜 제안했는지 비교하고 바로 상담 흐름으로 이어질 수 있게 합니다.",
  },
];

const comparisonChecks = [
  "가격만 맞는 추천이 아니라 연령대·고민·다운타임까지 맞는지 확인",
  "후기보다 앞서 총액, 회복 부담, 주의사항을 동시에 비교",
  "병원 제안에 추천 이유와 예약 가이드가 빠지지 않도록 표준화",
];

const expansionTracks = [
  "글로벌 환자 유치용 다국어 상담 흐름",
  "실시간 인기 시술 및 가격대 시각화",
  "홈케어·홈디바이스 추천 BM 연계",
  "수업 확장용 이미지·텍스트 분석 기능 탑재",
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
      alert(`로그인에 실패했어요. ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="pb-10 pt-4 sm:pt-5">
      <header className="shell mb-4">
        <div className="panel flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(28,25,23,0.18)]">
              TG
            </div>
            <div>
              <p className="eyebrow mb-2">beauty decision platform</p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.35rem] font-semibold text-stone-950 sm:text-[1.55rem]" data-display="true">
                  Tangle
                </h1>
                <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-500">
                  정보 비대칭 해결
                </span>
              </div>
              <p className="mt-1 text-[13px] text-stone-500 sm:text-[14px]">
                개인 맞춤형 시술 추천부터 견적 비교까지, 내 예산과 고민에 맞는 선택을 정리하는 뷰티 플랫폼
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/recommend" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
              추천 플로우
            </Link>
            <Link href="/request" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
              견적 요청
            </Link>
            <Link href="/hospital" className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm">
              파트너 센터
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
      </header>

      <main className="shell space-y-5">
        <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="panel flex h-full flex-col gap-5 overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">가격대 최적화 추천</span>
              <span className="eyebrow">설명 가능한 결과</span>
              <span className="eyebrow">역입찰 비교 구조</span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-[#f1d7cf] bg-[#fff4ef] px-3 py-1 text-[11px] font-semibold text-[#b45844]">
                  Tangle: 탱글
                </span>
                <h2 className="balance mt-3 text-[2.15rem] font-semibold leading-[1.02] text-stone-950 sm:text-[2.85rem] lg:text-[3.2rem]" data-display="true">
                  개인 맞춤형 시술 추천
                  <br />
                  견적 비교까지 한 곳에서
                </h2>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-stone-600 sm:text-[15px]">
                  예산, 고민, 연령대, 회복 허용도를 바탕으로 나에게 맞는 시술 조합을 추천하고,
                  바로 병원 견적 비교까지 이어주는 것이 탱글의 핵심입니다.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/recommend" className="action-primary text-center">
                    AI 추천 시작하기
                  </Link>
                  <Link href="/request" className="action-secondary text-center">
                    바로 견적 요청하기
                  </Link>
                </div>
              </div>

              <div className="grid gap-3">
                <article className="overflow-hidden rounded-[22px] border border-[#202633]/10 bg-[linear-gradient(145deg,#171d28_0%,#243248_60%,#2f2126_100%)] p-5 text-white shadow-[0_22px_48px_rgba(23,29,40,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      product snapshot
                    </p>
                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/75">
                      live flow
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[16px] border border-white/10 bg-white/8 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-white">맞춤 질문으로 고민 정리</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">5 step</span>
                      </div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/8 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-white">추천 조합과 예상 총액 확인</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">AI + DB</span>
                      </div>
                    </div>
                    <div className="rounded-[16px] border border-white/10 bg-white/8 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium text-white">병원 제안과 예약 안내 비교</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70">quote</span>
                      </div>
                    </div>
                  </div>
                </article>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  {decisionSignals.map((signal) => (
                    <article key={signal.label} className="metric-tile">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        {signal.label}
                      </p>
                      <p className="mt-2 text-[1.55rem] font-semibold text-stone-950" data-display="true">
                        {signal.value}
                      </p>
                      <p className="mt-2 text-[13px] leading-6 text-stone-500">{signal.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="compact-divider" />

            <div className="grid gap-3 lg:grid-cols-3">
              {trustPillars.map((pillar) => (
                <article key={pillar.title} className="soft-panel p-4">
                  <h3 className="text-[15px] font-semibold text-stone-950">{pillar.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-stone-600">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <section className="panel bg-[linear-gradient(145deg,#171d28_0%,#222d3f_58%,#2b1b21_100%)] px-5 py-5 text-white sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    decision board
                  </p>
                  <h3 className="mt-2 text-[1.7rem] font-semibold leading-[1.02] text-white" data-display="true">
                    오늘의 비교 기준
                  </h3>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/75">
                  product flow
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {flowSteps.map((item) => (
                  <article
                    key={item.step}
                    className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                        step {item.step}
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <h4 className="mt-3 text-[1.02rem] font-semibold text-white">{item.title}</h4>
                    <p className="mt-2 text-[13px] leading-6 text-white/72">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel px-5 py-5 sm:px-6">
              <p className="eyebrow mb-3">market potential</p>
              <h3 className="type-section balance" data-display="true">
                뷰티 탐색, 병원 비교, 홈케어 확장까지 이어질 수 있는 구조
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {expansionTracks.map((track) => (
                  <div key={track} className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-[13px] font-medium leading-6 text-stone-700">
                    {track}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="panel px-5 py-5 sm:px-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-3">comparison framework</p>
                <h3 className="type-section" data-display="true">
                  사용자가 꼭 봐야 할 비교 기준
                </h3>
              </div>
              <span className="hidden rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium text-stone-500 sm:inline-flex">
                후기보다 앞서 체크
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {comparisonChecks.map((item, index) => (
                <article key={item} className="soft-panel flex gap-4 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-[12px] font-semibold text-white">
                    0{index + 1}
                  </span>
                  <p className="text-[13px] leading-6 text-stone-700">{item}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-3">category scan</p>
                <h3 className="type-section" data-display="true">
                  시술 카테고리 한눈에 보기
                </h3>
              </div>
              <Link href="/recommend" className="text-[13px] font-semibold text-stone-500 hover:text-stone-950">
                추천 플로우로 바로 이동 →
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
                      <h4 className="mt-3 text-[1rem] font-semibold leading-6 text-stone-950">
                        {category.headline}
                      </h4>
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
        </section>
      </main>
    </div>
  );
}
