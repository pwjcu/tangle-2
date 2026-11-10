import Image from "next/image";
import { drAideePartner, partnerShopHref } from "@/lib/파트너";

type Props = { variant?: "feature" | "strip"; placement: string };

/** 탱글 × 닥터에이디 협찬 표기. 병원 정보와 시각적으로 분리하고 협찬임을 항상 밝힙니다. */
export default function TangleXDrAidee({ variant = "feature", placement }: Props) {
  const href = partnerShopHref(placement);
  const [first, second, third] = drAideePartner.models;

  if (variant === "strip") {
    return (
      <aside aria-label="탱글 파트너 브랜드" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(32,34,31,0.08)] bg-white/70 px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex -space-x-2" aria-hidden="true">
            {drAideePartner.models.map((model) => <Image key={model.src} src={model.src} alt="" width={64} height={64} className="h-8 w-8 rounded-full border-2 border-white object-cover object-top" />)}
          </span>
          <span className="rounded-full border border-[rgba(32,34,31,0.12)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-muted)]">{drAideePartner.label}</span>
          <strong className="text-[14px] font-normal text-[var(--color-carbon)]">탱글 × <span className="font-draidee text-[15px]">Doctor Aidee</span></strong>
          <span className="text-[var(--color-muted)]">{drAideePartner.tagline}</span>
        </div>
        {href && <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="font-semibold text-[var(--color-carbon)] underline underline-offset-4">공식몰 보기 ↗</a>}
      </aside>
    );
  }

  return (
    <section aria-labelledby={`partner-${placement}`} className="overflow-hidden rounded-[36px] border border-[rgba(32,34,31,0.06)] bg-[#f7f6f2] shadow-[0_30px_100px_rgba(32,34,31,0.08)]">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-10">
        <div>
          <p className="inline-flex rounded-full border border-[rgba(32,34,31,0.15)] px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-[var(--color-muted)]">{drAideePartner.label} · PARTNER</p>
          <h2 id={`partner-${placement}`} className="mt-6 text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--color-carbon)] sm:text-[2.6rem]">
            탱글 <span className="font-normal text-[var(--color-muted-light)]">×</span>{" "}
            <span className="font-draidee font-normal tracking-normal">Doctor Aidee</span>
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">{drAideePartner.name} · {drAideePartner.line}</p>
          <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-[var(--color-muted)]">
            탱글은 광고비로 병원 순위를 정하지 않습니다. 대신 서비스를 함께 만들어 가는 파트너가 있습니다.
            {" "}{drAideePartner.name}는 {drAideePartner.tagline} 브랜드입니다.
          </p>
          <p className="font-draidee mt-5 text-[15px] italic text-[var(--color-carbon)]">{drAideePartner.product}</p>
          <div className="mt-7">
            {href
              ? <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-carbon)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">{drAideePartner.name} 공식몰 보기 ↗</a>
              : <span className="inline-flex rounded-full border border-[rgba(32,34,31,0.15)] px-5 py-3 text-sm text-[var(--color-muted)]">공식몰 오픈 준비 중</span>}
          </div>
        </div>
        <div className="order-first grid grid-cols-3 items-start gap-2 sm:gap-3 lg:order-none">
          {[first, second, third].map((model, index) => (
            <div key={model.src} className={`overflow-hidden rounded-[20px] bg-white sm:rounded-[26px] ${index === 1 ? "mt-0" : "mt-6 sm:mt-10"}`}>
              <Image src={model.src} alt={model.alt} width={model.width} height={model.height} sizes="(min-width: 1024px) 240px, 33vw" className="aspect-[4/5] h-auto w-full object-cover object-top" />
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-[rgba(32,34,31,0.08)] px-6 py-4 text-[12px] leading-6 text-[var(--color-muted)] sm:px-8 lg:px-10">{drAideePartner.disclosure}</p>
    </section>
  );
}
