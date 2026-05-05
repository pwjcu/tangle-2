import Link from "next/link";

interface ContactLink {
  label: string;
  href?: string;
}

interface RecommendedClinic {
  name: string;
  area: string;
  fit: string;
  focus: string[];
  note: string;
  links: ContactLink[];
}

const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "";

const recommendedClinics: RecommendedClinic[] = [
  {
    name: "리프팅·탄력 상담 병원",
    area: "서울 강남권",
    fit: "처짐, 탄력, 윤곽 고민을 가진 고객",
    focus: ["울쎄라", "올리지오", "스킨부스터"],
    note: "추천 결과와 예산을 먼저 확인한 뒤 상담 가능 여부를 빠르게 안내하는 참여 병원 예시입니다.",
    links: [
      { label: "카카오 채널" },
      { label: "네이버 예약" },
      { label: "홈페이지" },
    ],
  },
  {
    name: "피부결·모공 관리 병원",
    area: "서울 성수/압구정",
    fit: "모공, 흉터, 피부결 개선을 단계적으로 보고 싶은 고객",
    focus: ["포텐자", "리쥬란", "LDM"],
    note: "과한 시술보다 회복과 반복 관리 계획을 함께 제안하는 병원 카드로 확장할 수 있습니다.",
    links: [
      { label: "카카오 채널" },
      { label: "네이버 예약" },
      { label: "홈페이지" },
    ],
  },
  {
    name: "글로벌 상담 가능 병원",
    area: "서울 주요 상권",
    fit: "한국 시술을 찾는 해외 고객",
    focus: ["영어 상담", "일본어 상담", "사전 견적"],
    note: "향후 영어, 일본어, 중국어, 태국어 상담 흐름과 연결되는 글로벌 예약 카드입니다.",
    links: [
      { label: "카카오 채널" },
      { label: "네이버 예약" },
      { label: "홈페이지" },
    ],
  },
];

export default function BookingPage() {
  return (
    <div className="pb-12">
      <header className="sticky top-2 z-30 sm:top-4">
        <div className="shell">
          <div className="flex min-h-[56px] items-center justify-between rounded-full border border-[rgba(32,34,31,0.07)] bg-white/58 px-4 py-2 shadow-[0_18px_60px_rgba(32,34,31,0.07)] backdrop-blur-2xl">
            <Link href="/" className="ghost-link">
              Tangle
            </Link>
            <Link href="/request" className="ghost-link">
              견적 요청
            </Link>
          </div>
        </div>
      </header>

      <main className="shell pt-6 sm:pt-10">
        <section className="overflow-hidden rounded-[34px] border border-[rgba(32,34,31,0.06)] bg-white/82 p-5 shadow-[0_30px_100px_rgba(32,34,31,0.08)] backdrop-blur-xl sm:rounded-[44px] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="eyebrow">clinic booking</p>
              <h1 className="type-title mt-5 !text-[2.55rem] sm:!text-[3.5rem] lg:!text-[4rem]" data-display="true">
                추천 병원과
                <br />
                바로 연결합니다
              </h1>
              <p className="mt-5 max-w-[660px] text-[14px] leading-7 text-[var(--color-muted)] sm:text-[16px] sm:leading-8">
                추천 결과를 확인한 사용자는 무료 참여 병원 중 조건이 맞는 곳을 고르고, 카카오 채널, 네이버 예약, 병원 홈페이지로 바로 이동할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["추천 기반", "무료 참여", "바로 컨택"].map((item, index) => (
                <article key={item} className="rounded-[28px] border border-[rgba(32,34,31,0.06)] bg-[var(--color-porcelain-gray)] p-5">
                  <p className="text-[12px] font-semibold text-[var(--color-muted-light)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-8 text-[1.2rem] font-semibold tracking-[-0.05em]" data-display="true">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          {recommendedClinics.map((clinic) => (
            <article
              key={clinic.name}
              className="rounded-[34px] border border-[rgba(32,34,31,0.06)] bg-white/78 p-5 shadow-[0_22px_70px_rgba(32,34,31,0.06)] backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold text-[var(--color-muted-light)]">{clinic.area}</p>
                  <h2 className="mt-4 text-[1.55rem] font-semibold leading-tight tracking-[-0.055em]" data-display="true">
                    {clinic.name}
                  </h2>
                </div>
                <span className="rounded-full bg-[var(--color-genius-yellow)] px-3 py-1.5 text-[11px] font-semibold">
                  무료 참여
                </span>
              </div>

              <p className="mt-5 text-[14px] leading-7 text-[var(--color-muted)]">{clinic.note}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {clinic.focus.map((item) => (
                  <span key={item} className="rounded-full border border-[rgba(32,34,31,0.08)] bg-[var(--color-porcelain-gray)] px-3 py-1.5 text-[12px] font-semibold">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] bg-[var(--color-porcelain-gray)] p-4">
                <p className="text-[12px] font-semibold text-[var(--color-muted-light)]">추천 핏</p>
                <p className="mt-2 text-[14px] font-semibold">{clinic.fit}</p>
              </div>

              <div className="mt-6 grid gap-2">
                {clinic.links.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="action-secondary !w-full !px-4 !py-3 !text-[13px]"
                    >
                      {link.label} 열기
                    </a>
                  ) : (
                    <button
                      key={link.label}
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(32,34,31,0.08)] bg-white/50 px-4 py-3 text-[13px] font-semibold text-[var(--color-muted-light)]"
                    >
                      {link.label} 연결 예정
                    </button>
                  ),
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-[34px] border border-[rgba(32,34,31,0.06)] bg-[linear-gradient(135deg,#eee87f_0%,#dff8ee_56%,#f7f5ff_100%)] p-5 shadow-[0_22px_70px_rgba(32,34,31,0.06)] sm:p-7">
          <p className="eyebrow">next data</p>
          <h2 className="mt-5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2.2rem]" data-display="true">
            실제 병원별 링크만 넣으면 예약 허브로 확장됩니다
          </h2>
          <p className="mt-4 max-w-[820px] text-[14px] leading-7 text-[rgba(32,34,31,0.72)] sm:text-[15px]">
            운영 단계에서는 병원명, 진료 지역, 강점 시술, 카카오 채널 URL, 네이버 예약 URL, 홈페이지 URL을 병원 계정이 직접 등록하고, 추천 결과와 맞는 병원만 사용자에게 노출하는 방식으로 고도화합니다.
          </p>
          {kakaoChannelUrl ? (
            <a href={kakaoChannelUrl} target="_blank" rel="noreferrer" className="action-secondary mt-6">
              탱글 카카오 채널로 참여 문의
            </a>
          ) : null}
        </section>
      </main>
    </div>
  );
}
