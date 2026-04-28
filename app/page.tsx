"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { accentStyles, treatmentCategories } from "../lib/siteContent";

const trustPillars = [
  {
    title: "팩트 기반 가격대",
    description: "시술별 가격 범위와 조합 총액을 먼저 보고 불필요한 추천을 걸러냅니다.",
  },
  {
    title: "맞춤형 추천 로직",
    description: "나이, 예산, 고민, 다운타임 허용도까지 묻고 결과를 설명 가능한 형태로 보여줍니다.",
  },
  {
    title: "역입찰형 제안",
    description: "사용자 요청을 바탕으로 병원이 가격과 추천 이유를 제안하는 구조를 지향합니다.",
  },
];

const steps = [
  {
    step: "01",
    title: "현재 고민을 구조화",
    body: "탄력, 모공, 색소처럼 막연한 고민을 예산과 회복 허용도 기준으로 다시 정리합니다.",
  },
  {
    step: "02",
    title: "추천 근거를 확인",
    body: "추천 결과는 총액, 시술별 역할, 주의사항, 병원 상담 포인트까지 함께 보여줍니다.",
  },
  {
    step: "03",
    title: "바로 견적 요청 연결",
    body: "마음에 드는 추천 조합을 그대로 요청서에 넘겨 병원 제안과 비교 단계로 이어집니다.",
  },
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
    <div className="pb-16 pt-5 sm:pt-7">
      <header className="shell mb-6">
        <div className="panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="eyebrow mb-2">beauty decision platform</p>
            <h1
              className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl"
              data-display="true"
            >
              Tangle
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              가격만 싼 시술이 아니라, 나에게 맞는 선택을 찾는 뷰티 의사결정 플랫폼
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/hospital"
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-300 hover:text-stone-900"
            >
              파트너 센터
            </Link>
            {userEmail ? (
              <>
                <Link
                  href={`/my${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-300 hover:text-stone-900"
                >
                  받은 제안함
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                onClick={handleKakaoLogin}
                className="rounded-full bg-[#FEE500] px-4 py-2 text-sm font-bold text-[#3c1e1e] shadow-sm hover:-translate-y-0.5 hover:shadow-md"
              >
                카카오로 시작하기
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="shell space-y-10">
        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel overflow-hidden px-6 py-7 sm:px-8 sm:py-9">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="eyebrow">정보 비대칭 해결</span>
              <span className="eyebrow">가격대 최적화 추천</span>
              <span className="eyebrow">역입찰 제안 구조</span>
            </div>

            <h2
              className="max-w-3xl text-[2.25rem] font-bold leading-[1.02] text-stone-950 sm:text-[3.5rem]"
              data-display="true"
            >
              시술 추천을
              <br />
              설명 가능한 선택으로
              <br />
              바꾸는 플랫폼
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              Tangle은 예산, 고민, 회복 허용도에 맞춘 추천을 먼저 정리하고 그 다음에 견적
              비교로 연결합니다. 불필요한 시술을 줄이고, 신뢰할 수 있는 가격대와 제안 근거를
              함께 보게 만드는 것이 목표입니다.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/recommend"
                className="rounded-[20px] bg-stone-950 px-6 py-4 text-center text-base font-semibold text-white shadow-[0_18px_45px_rgba(20,16,14,0.22)] hover:-translate-y-0.5 hover:bg-stone-800"
              >
                AI 추천 시작하기
              </Link>
              <Link
                href="/request"
                className="rounded-[20px] border border-stone-200 bg-white px-6 py-4 text-center text-base font-semibold text-stone-900 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
              >
                바로 견적 요청하기
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {trustPillars.map((pillar) => (
                <article key={pillar.title} className="soft-panel p-4">
                  <h3 className="text-sm font-bold text-stone-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="panel bg-[linear-gradient(135deg,#1f2737_0%,#2c1d25_100%)] px-6 py-7 text-white">
              <p className="text-sm uppercase tracking-[0.26em] text-white/60">why users stay</p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-white/85">
                <li>
                  <span className="block text-2xl font-bold text-white" data-display="true">
                    맞춤 추천
                  </span>
                  단순 키워드 추천이 아니라 예산과 회복 부담까지 함께 반영합니다.
                </li>
                <li>
                  <span className="block text-2xl font-bold text-white" data-display="true">
                    비교 가능한 견적
                  </span>
                  병원 제안은 가격만이 아니라 왜 이 시술을 권하는지까지 남도록 설계합니다.
                </li>
              </ul>
            </div>

            <div className="panel px-6 py-6">
              <p className="text-sm uppercase tracking-[0.22em] text-stone-400">for next build</p>
              <h3 className="mt-2 text-2xl font-bold text-stone-950" data-display="true">
                글로벌 환자와 홈케어까지 이어질 구조
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                리팩토링 이후에는 멀티언어 상담, 이미지 기반 피부 고민 분류, 홈케어·홈디바이스
                추천까지 점진적으로 확장할 수 있도록 구조를 잡습니다.
              </p>
            </div>
          </aside>
        </section>

        <section className="panel px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">how tangle works</p>
              <h2 className="text-3xl font-bold text-stone-950" data-display="true">
                홈에서 바로 보이는 핵심 흐름
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              홈, 추천, 견적 요청, 받은 제안함의 흐름이 한 번에 이어져야 사용자가 서비스 구조를
              직관적으로 이해할 수 있습니다.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {steps.map((item) => (
              <article key={item.step} className="soft-panel p-5">
                <p className="text-sm font-bold text-[#d4634e]">{item.step}</p>
                <h3 className="mt-3 text-xl font-bold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel px-6 py-7 sm:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">explore by category</p>
              <h2 className="text-3xl font-bold text-stone-950" data-display="true">
                시술 카테고리부터 비교 시작하기
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              블로그 대신 실제 비교에 필요한 시술 카테고리와 대표 효과, 예산 감각을 먼저 보여주는
              구조로 바꿉니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {treatmentCategories.map((category) => {
              const accent = accentStyles[category.accent];
              return (
                <Link
                  key={category.name}
                  href={`/category/${encodeURIComponent(category.name)}`}
                  className="soft-panel flex h-full flex-col justify-between p-5 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${accent.chip}`}>
                      {category.name}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-stone-900">{category.headline}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{category.description}</p>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-stone-500">
                    <p>
                      <span className="font-semibold text-stone-900">대표 시술</span> {category.examples}
                    </p>
                    <p>
                      <span className="font-semibold text-stone-900">적합한 고민</span> {category.audience}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel px-6 py-7 sm:px-8">
            <p className="eyebrow mb-3">user outcome</p>
            <h2 className="text-3xl font-bold text-stone-950" data-display="true">
              사용자가 가장 중요하게 봐야 할 것
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-600">
              <li>
                <span className="font-semibold text-stone-900">가격만 맞는 시술이 아니라</span> 나이,
                성별, 고민, 회복 허용도에 맞는지까지 확인되어야 합니다.
              </li>
              <li>
                <span className="font-semibold text-stone-900">후기보다 근거가 먼저</span> 보여야 합니다.
                가격 범위, 회복 정보, 주의사항을 한 화면에서 같이 비교해야 신뢰가 생깁니다.
              </li>
              <li>
                <span className="font-semibold text-stone-900">견적은 제안서처럼</span> 도착해야 합니다.
                병원은 추천 시술, 이유, 예약 안내까지 함께 보내는 구조가 필수입니다.
              </li>
            </ul>
          </div>

          <div className="panel px-6 py-7 sm:px-8">
            <p className="eyebrow mb-3">ready for class expansion</p>
            <h2 className="text-3xl font-bold text-stone-950" data-display="true">
              이후 수업 기법을 붙이기 좋은 구조
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "CNN 기반 피부 사진 고민 분류",
                "RNN/BERT 기반 후기 신뢰도 요약",
                "프롬프트 엔지니어링 기반 추천 보고서",
                "가격/인기 시술 데이터 시각화",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-medium text-stone-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
