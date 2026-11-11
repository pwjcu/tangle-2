"use client";

import { usePathname } from "next/navigation";

/** 홈에는 큰 배너가 있어 푸터 띠를 겹쳐 보여 주지 않습니다. */
export default function FooterPartnerStrip({ children }: { children: React.ReactNode }) {
  return usePathname() === "/" ? null : <div className="mt-5">{children}</div>;
}
