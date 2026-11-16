import Link from "next/link";

/** 진한 초록 사각형 + 코랄 점 + ‘탱글’. 앱 아이콘(app/icon.png)과 같은 모양입니다. */
export default function TangleLogo({ size = "md", withWord = true, inverse = false }: { size?: "sm" | "md" | "lg"; withWord?: boolean; inverse?: boolean }) {
  const box = { sm: "h-8 w-8 text-[11px] rounded-[9px]", md: "h-10 w-10 text-[13px] rounded-[11px]", lg: "h-14 w-14 text-[18px] rounded-[15px]" }[size];
  const dot = { sm: "h-[6px] w-[6px] right-[4px] top-[4px]", md: "h-[7px] w-[7px] right-[5px] top-[5px]", lg: "h-[10px] w-[10px] right-[7px] top-[7px]" }[size];
  const word = { sm: "text-[18px]", md: "text-[21px]", lg: "text-[28px]" }[size];
  return (
    <Link href="/" aria-label="탱글 홈" className="inline-flex items-center gap-2.5">
      <span className={`relative inline-flex shrink-0 items-center justify-center bg-[var(--brand)] font-black tracking-[-0.04em] text-white ${box}`}>
        탱글
        <span aria-hidden="true" className={`absolute rounded-full bg-[var(--accent)] ${dot}`} />
      </span>
      {withWord && <span className={`font-bold tracking-[-0.045em] ${inverse ? "text-white" : "text-[var(--brand)]"} ${word}`}>tangle</span>}
    </Link>
  );
}
