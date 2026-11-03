"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuoteConnectionNotice, useQuoteConnection } from "../components/견적연결";
import { parseBidComment } from "../../lib/bids";
import type { SupportedLanguage } from "../../lib/i18n";
import { commonUi, formatCount, formatDate, formatPrice, localizeCategoryName } from "../../lib/localizedUi";
import { useLanguage } from "../components/LanguageProvider";

interface Bid {
  id: number;
  hospital_name: string;
  price: number;
  comment: string;
  created_at: string;
}

interface RequestRecord {
  id: number;
  category: string;
  symptom: string;
  budget: number;
  created_at: string;
  bids: Bid[];
}


interface MyPageCopy {
  navInbox: string;
  switchEmail: string;
  eyebrow: string;
  title: string[];
  body: string;
  checkButton: string;
  checking: string;
  loadedTitle: string;
  loadedBody: (email: string) => string;
  metrics: {
    requests: string;
    offers: string;
  };
  lowestOffer: string;
  noOffers: string;
  offerLabel: (index: number) => string;
  fields: {
    plan: string;
    reason: string;
    reservation: string;
    missing: string;
  };
  continueCta: string;
  alerts: {
    loadFail: string;
    noHistory: string;
    selected: (hospitalName: string) => string;
  };
}

const myCopy: Record<SupportedLanguage, MyPageCopy> = {
  ko: {
    navInbox: "Proposal Inbox",
    switchEmail: "다른 이메일 조회",
    eyebrow: "proposal inbox",
    title: ["받은 병원 제안을", "확인합니다"],
    body: "견적 요청 시 입력한 이메일을 기준으로 병원 제안을 불러옵니다.",
    checkButton: "제안 확인",
    checking: "조회 중",
    loadedTitle: "받은 제안 비교",
    loadedBody: (email) => `${email} 기준으로 도착한 병원 제안을 불러왔습니다.`,
    metrics: { requests: "requests", offers: "offers" },
    lowestOffer: "lowest offer",
    noOffers: "아직 도착한 제안이 없습니다.",
    offerLabel: (index) => `offer ${String(index + 1).padStart(2, "0")}`,
    fields: { plan: "추천 시술", reason: "제안 이유", reservation: "예약 안내", missing: "별도 기재 없음" },
    continueCta: "이 제안으로 상담 이어가기",
    alerts: {
      loadFail: "제안 데이터를 불러오지 못했습니다.",
      noHistory: "등록된 요청 이력이 없습니다.",
      selected: (hospitalName) => `'${hospitalName}' 제안을 선택했습니다. 실제 예약 연결 단계는 다음 리팩토링에서 이어집니다.`,
    },
  },
  en: {
    navInbox: "Proposal Inbox",
    switchEmail: "Check another email",
    eyebrow: "proposal inbox",
    title: ["Check clinic offers", "you received"],
    body: "Load clinic offers using the email you entered when requesting a quote.",
    checkButton: "Check offers",
    checking: "Checking",
    loadedTitle: "Compare received offers",
    loadedBody: (email) => `Loaded clinic offers sent to ${email}.`,
    metrics: { requests: "requests", offers: "offers" },
    lowestOffer: "lowest offer",
    noOffers: "No offers have arrived yet.",
    offerLabel: (index) => `offer ${String(index + 1).padStart(2, "0")}`,
    fields: { plan: "Recommended plan", reason: "Offer reason", reservation: "Booking guidance", missing: "Not provided" },
    continueCta: "Continue consultation with this offer",
    alerts: {
      loadFail: "Could not load offer data.",
      noHistory: "No request history was found.",
      selected: (hospitalName) => `Selected the offer from '${hospitalName}'. The real booking connection step will follow in the next refactor.`,
    },
  },
  zh: {
    navInbox: "提案收件箱",
    switchEmail: "查询其他邮箱",
    eyebrow: "提案收件箱",
    title: ["确认收到的", "医院提案"],
    body: "根据申请报价时填写的邮箱，加载医院提案。",
    checkButton: "确认提案",
    checking: "查询中",
    loadedTitle: "比较收到的提案",
    loadedBody: (email) => `已加载发送到 ${email} 的医院提案。`,
    metrics: { requests: "请求", offers: "提案" },
    lowestOffer: "最低提案",
    noOffers: "暂时还没有收到提案。",
    offerLabel: (index) => `提案 ${String(index + 1).padStart(2, "0")}`,
    fields: { plan: "推荐项目", reason: "提案理由", reservation: "预约说明", missing: "未填写" },
    continueCta: "用此提案继续咨询",
    alerts: {
      loadFail: "无法加载提案数据。",
      noHistory: "没有找到已登记的请求记录。",
      selected: (hospitalName) => `已选择 '${hospitalName}' 的提案。实际预约连接步骤将在下一次重构中继续。`,
    },
  },
  ja: {
    navInbox: "提案ボックス",
    switchEmail: "別のメールを確認",
    eyebrow: "提案ボックス",
    title: ["届いたクリニック提案を", "確認します"],
    body: "見積依頼時に入力したメールを基準に、クリニック提案を読み込みます。",
    checkButton: "提案を確認",
    checking: "確認中",
    loadedTitle: "届いた提案を比較",
    loadedBody: (email) => `${email} 宛てに届いたクリニック提案を読み込みました。`,
    metrics: { requests: "依頼", offers: "提案" },
    lowestOffer: "最安提案",
    noOffers: "まだ届いた提案はありません。",
    offerLabel: (index) => `提案 ${String(index + 1).padStart(2, "0")}`,
    fields: { plan: "推薦施術", reason: "提案理由", reservation: "予約案内", missing: "記載なし" },
    continueCta: "この提案で相談を続ける",
    alerts: {
      loadFail: "提案データを読み込めませんでした。",
      noHistory: "登録された依頼履歴がありません。",
      selected: (hospitalName) => `'${hospitalName}' の提案を選択しました。実際の予約連携は次のリファクタリングで続きます。`,
    },
  },
  th: {
    navInbox: "กล่องข้อเสนอ",
    switchEmail: "ตรวจอีเมลอื่น",
    eyebrow: "กล่องข้อเสนอ",
    title: ["ตรวจข้อเสนอ", "จากคลินิก"],
    body: "โหลดข้อเสนอจากคลินิกโดยใช้อีเมลที่กรอกตอนขอราคา",
    checkButton: "ตรวจข้อเสนอ",
    checking: "กำลังตรวจ",
    loadedTitle: "เปรียบเทียบข้อเสนอที่ได้รับ",
    loadedBody: (email) => `โหลดข้อเสนอจากคลินิกที่ส่งถึง ${email} แล้ว`,
    metrics: { requests: "คำขอ", offers: "ข้อเสนอ" },
    lowestOffer: "ข้อเสนอราคาต่ำสุด",
    noOffers: "ยังไม่มีข้อเสนอเข้ามา",
    offerLabel: (index) => `ข้อเสนอ ${String(index + 1).padStart(2, "0")}`,
    fields: { plan: "ชุดหัตถการที่แนะนำ", reason: "เหตุผลข้อเสนอ", reservation: "คำแนะนำการจอง", missing: "ไม่ได้ระบุ" },
    continueCta: "ปรึกษาต่อด้วยข้อเสนอนี้",
    alerts: {
      loadFail: "ไม่สามารถโหลดข้อมูลข้อเสนอได้",
      noHistory: "ไม่พบประวัติคำขอที่ลงทะเบียน",
      selected: (hospitalName) => `เลือกข้อเสนอจาก '${hospitalName}' แล้ว ขั้นตอนเชื่อมต่อการจองจริงจะทำต่อในการปรับปรุงครั้งถัดไป`,
    },
  },
};

export default function MyPage() {
  const { language } = useLanguage();
  const copy = myCopy[language];
  const ui = commonUi[language];
  const connection = useQuoteConnection("/my");
  const [myRequests, setMyRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const english = language !== "ko";

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    async function load() {
      setMyRequests([]);
      setLoaded(false);
      setError("");
      if (!connection.enabled || !connection.userId) return;
      setLoading(true);
      try {
        const response = await fetch("/api/my-requests", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "요청을 불러오지 못했습니다.");
        if (current) { setMyRequests(data.requests || []); setLoaded(true); }
      } catch (reason) {
        if (current) setError(reason instanceof Error ? reason.message : "요청을 불러오지 못했습니다.");
      } finally { if (current) setLoading(false); }
    }
    void load();
    return () => { current = false; controller.abort(); };
  }, [connection.enabled, connection.userId, refresh]);

  return <main className="shell py-8">
    <nav className="mb-8 flex items-center justify-between gap-4" aria-label={english ? "Inbox navigation" : "견적함 메뉴"}>
      <Link href="/" className="ghost-link">탱글</Link>
      <Link href="/request" className="action-secondary">{english ? "Prepare a request" : "새 요청 작성"}</Link>
    </nav>
    <section className="rounded-[32px] bg-white p-6 sm:p-9">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1 className="type-section mt-4">{copy.loadedTitle}</h1>
      <p className="mt-4 type-copy">{english ? "Only requests belonging to your signed-in account are shown." : "로그인한 내 계정의 요청과 병원 제안만 확인합니다."}</p>
      <div className="mt-6"><QuoteConnectionNotice {...connection} english={english} /></div>
      {(error || connection.error) && <p role="alert" className="mt-4 text-sm text-red-700">{error || connection.error}</p>}
      {connection.enabled && connection.checked && !connection.userId && <button onClick={() => void connection.login()} className="action-primary mt-5">{english ? "Log in with Kakao" : "카카오로 로그인"}</button>}
      {connection.enabled && connection.userId && <div className="mt-5 flex flex-wrap items-center gap-4">
        <span className="text-sm text-[var(--color-muted)]">{connection.email}</span>
        <button disabled={loading} onClick={() => setRefresh((value) => value + 1)} className="action-secondary disabled:opacity-50">{loading ? copy.checking : english ? "Refresh" : "새로고침"}</button>
      </div>}
    </section>
    {loading && <p role="status" className="p-6">{copy.checking}</p>}
    {loaded && myRequests.length === 0 && <section className="mt-5 rounded-[28px] bg-white p-7">
      <h2 className="text-xl font-semibold">{copy.alerts.noHistory}</h2>
      <p className="mt-3 type-copy">{english ? "New requests will appear here. Older email-only requests need an ownership check before they can be linked." : "새 요청을 작성하면 이곳에 표시됩니다. 이전 이메일 방식으로 작성한 요청은 본인 확인 후 연결이 필요할 수 있어요."}</p>
      <Link href="/request" className="action-primary mt-5">{english ? "Create a request" : "요청 작성하기"}</Link>
    </section>}
    {loaded && myRequests.length > 0 && <p className="my-5 text-sm text-[var(--color-muted)]">{formatCount(myRequests.length, language)} {english ? "requests · Up to 100 latest requests" : "개 요청 · 최근 100개까지 표시"}</p>}
    {myRequests.map((request) => <article key={request.id} className="mt-5 rounded-[28px] bg-white p-6 sm:p-8">
      <p className="text-sm text-[var(--color-muted)]">#{request.id} · {formatDate(request.created_at, language)}</p>
      <h2 className="mt-3 text-2xl font-semibold">{localizeCategoryName(request.category, language)} · {ui.budget} {formatPrice(request.budget, language)}</h2>
      <p className="mt-4 whitespace-pre-wrap type-copy">{request.symptom}</p>
      {(request.bids || []).length === 0 ? <p className="mt-6 rounded-2xl bg-[var(--color-porcelain-gray)] p-5">{copy.noOffers}</p> : <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[...(request.bids || [])].sort((a, b) => a.price - b.price).map((bid) => {
          const parsed = parseBidComment(bid.comment);
          return <section key={bid.id} className="rounded-2xl border border-[var(--color-line)] p-5">
            <h3 className="text-xl font-semibold">{bid.hospital_name}</h3>
            <p className="mt-2 text-xl">{formatPrice(bid.price, language)}</p>
            <dl className="mt-5 space-y-4">{[
              [copy.fields.plan, parsed.plan], [copy.fields.reason, parsed.reason], [copy.fields.reservation, parsed.reservation],
            ].map(([label, value]) => <div key={label}><dt className="text-sm font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-7 text-[var(--color-muted)]">{value || copy.fields.missing}</dd></div>)}</dl>
            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-6">{english ? "This is a quote, not a confirmed reservation. Confirm the final price and appointment with the clinic using its guidance above." : "병원 제안은 예약 확정이 아닙니다. 위 상담 안내에 따라 최종 비용과 일정을 병원에 확인해 주세요."}</p>
          </section>;
        })}
      </div>}
    </article>)}
  </main>;
}
