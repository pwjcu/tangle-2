import Image from "next/image";
import { drAideePartner, partnerShopHref } from "@/lib/파트너";

type Props = { variant?: "feature" | "strip"; placement: string };

/** 탱글 × 닥터에이디 협찬 표기. 병원 정보와 시각적으로 분리하고 협찬임을 항상 밝힙니다. */
export default function TangleXDrAidee({ variant = "feature", placement }: Props) {
  const href = partnerShopHref(placement);

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

  const { banner, bannerTall } = drAideePartner;
  const images = (
    <>
      <Image src={bannerTall.src} alt={bannerTall.alt} width={bannerTall.width} height={bannerTall.height} sizes="100vw" className="h-auto w-full sm:hidden" />
      <Image src={banner.src} alt={banner.alt} width={banner.width} height={banner.height} sizes="(min-width: 1100px) 1080px, 100vw" className="hidden h-auto w-full sm:block" />
    </>
  );

  return (
    <aside aria-label="탱글 파트너 브랜드" className="mx-auto max-w-[1080px]">
      <div className="overflow-hidden rounded-[24px] border border-[rgba(32,34,31,0.08)] bg-white sm:rounded-[32px]">
        {href ? <a href={href} target="_blank" rel="sponsored noopener noreferrer" aria-label={`${drAideePartner.name} 공식몰 열기`} className="block hover:opacity-95">{images}</a> : images}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(32,34,31,0.06)] px-5 py-5 sm:px-8">
          <div>
            <p className="text-xl font-semibold tracking-[-0.03em] text-[var(--color-carbon)] sm:text-2xl">{drAideePartner.tagline}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{drAideePartner.product}</p>
          </div>
          {href && <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-carbon)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-auto">공식몰에서 보기 ↗</a>}
        </div>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 px-1 text-[11px] leading-5 text-[var(--color-muted)]">
        <span className="font-semibold tracking-[0.12em]">{drAideePartner.label}</span>
        <span>{drAideePartner.disclosure}</span>
      </p>
    </aside>
  );
}
