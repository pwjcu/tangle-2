"use client";
import Link from "next/link";
import { useLanguage } from "../components/LanguageProvider";

export default function BookingPage() {
  const { language } = useLanguage();
  const ko = language === "ko";
  const steps = ko ? [
    { title: "후보를 찾기", text: "서울 경험 추천에서 관심 시술과 의료진을 찾아보고, 현재 소속과 진료 여부를 확인해 주세요.", href: "/clinics", action: "서울 추천 살펴보기" },
    { title: "조건을 비교하기", text: "같은 샷수·용량·회차인지 확인하고, 포함 항목과 추가 비용을 상담 때 물어보세요.", href: "/prices", action: "규격별 가격 보기" },
    { title: "상담을 준비하기", text: "예산, 원하는 변화와 회복 가능 시간을 메모로 정리해 두세요.", href: "/request", action: "상담 메모 만들기" },
  ] : [
    { title: "Find candidates", text: "Browse Seoul experience notes. Confirm the doctor's current clinic and availability directly.", href: "/clinics", action: "Browse Seoul notes" },
    { title: "Compare conditions", text: "Match shot count, volume, sessions, included items and additional costs.", href: "/prices", action: "Compare reference prices" },
    { title: "Prepare questions", text: "Organize your budget, goals and available recovery time before contacting the clinic.", href: "/request", action: "Prepare consultation notes" },
  ];
  return <main className="shell pb-16 pt-7">
    <nav aria-label={ko ? "상담 안내 메뉴" : "Consultation navigation"} className="flex items-center justify-between gap-4"><Link href="/" className="text-2xl font-semibold text-[#244e3e]">tangle.</Link><Link href="/clinics" className="ghost-link">{ko ? "서울 경험 추천" : "Seoul guide"} →</Link></nav>
    <section className="mt-8 rounded-[32px] bg-[#183e34] p-6 text-white sm:p-10">
      <p className="text-xs tracking-widest text-[#c5e2d2]">BEFORE YOUR CONSULTATION</p>
      <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">{ko ? "상담 예약 전, 차근차근." : "Prepare your clinic consultation."}</h1>
      <p className="mt-6 max-w-2xl text-sm leading-7 text-[#d4e4dc]">{ko ? "후보를 정하고, 같은 조건의 가격을 비교하고, 상담에서 물어볼 점을 정리해요. 현재 탱글에서는 병원의 실시간 예약 가능 시간이나 예약 확정 기능을 제공하지 않습니다." : "Choose candidates, compare equivalent specifications and prepare questions. Tangle does not currently provide live appointment slots or booking confirmation."}</p>
    </section>
    <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label={ko ? "상담 준비 순서" : "Consultation steps"}>
      {steps.map((step, index) => <article key={step.href} className="flex flex-col rounded-[28px] border border-[#dce8df] bg-white p-6"><span className="text-xs font-semibold text-[#75947a]">0{index+1}</span><h2 className="mt-5 text-2xl font-semibold">{step.title}</h2><p className="mb-7 mt-4 flex-1 text-sm leading-7 text-[#637066]">{step.text}</p><Link href={step.href} className="action-secondary !px-4">{step.action} →</Link></article>)}
    </section>
    <section className="mt-7 rounded-[28px] border border-[#dce8df] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold">{ko ? "상담에서 확인할 체크 포인트" : "Questions to confirm with the clinic"}</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-[#637066]">{(ko ? ["실제로 상담하고 시술하는 의료진은 누구인가요?", "시술명·장비·부위·용량·회차와 총비용은 어떻게 되나요?", "제 상태에서 시술이 필요한지, 다른 선택지도 있는지 설명해 주세요.", "예상 회복 기간과 부작용 발생 시 연락·대응 절차는 무엇인가요?"] : ["Who will consult and perform the procedure?", "What are the device, area, volume, sessions and total cost?", "Is it suitable for me, and what alternatives are available?", "What recovery and follow-up arrangements should I expect?"]).map((item) => <li key={item}>{item}</li>)}</ul></section>
  </main>;
}
