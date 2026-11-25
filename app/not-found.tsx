import Link from "next/link";
import SiteHeader from "./components/사이트헤더";

export default function NotFound() {
  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />
      <section className="shell max-w-xl py-24 text-center">
        <p className="text-[13px] font-bold tracking-[0.1em] text-[var(--accent)]">404</p>
        <h1 className="type-section mt-4">찾는 페이지가 없어요</h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">주소가 바뀌었거나 사라진 페이지예요. 아래에서 다시 찾아보세요.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/" className="action-primary">홈으로</Link>
          <Link href="/clinics" className="action-secondary">추천 병원</Link>
          <Link href="/prices" className="action-secondary">시술 가격</Link>
        </div>
      </section>
    </main>
  );
}
