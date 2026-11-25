"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[탱글] 화면 오류", error.digest ?? error.message);
  }, [error]);
  return (
    <main className="min-h-screen pb-28">
      <section className="shell max-w-xl py-24 text-center">
        <p className="text-[13px] font-bold tracking-[0.1em] text-[var(--accent)]">잠시 문제가 생겼어요</p>
        <h1 className="type-section mt-4">화면을 불러오지 못했어요</h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">일시적인 문제일 수 있어요. 다시 시도해 보거나 홈으로 돌아가 주세요.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="action-primary">다시 시도</button>
          <Link href="/" className="action-secondary">홈으로</Link>
        </div>
      </section>
    </main>
  );
}
