/** 병원 홈페이지·예약·전화 같은 바깥 링크 버튼. 전화는 같은 창, 나머지는 새 창으로 엽니다. */
export default function LinkChip({ href, label }: { href: string; label: string }) {
  const phone = href.startsWith("tel:");
  return (
    <a href={href} target={phone ? undefined : "_blank"} rel={phone ? undefined : "noopener noreferrer"}
      className="rounded-full border border-[#cfe0d6] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f5544] hover:bg-[#eef6f1]">
      {label} ↗
    </a>
  );
}
