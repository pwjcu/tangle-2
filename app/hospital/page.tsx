"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuoteConnectionNotice, useQuoteConnection } from "../components/견적연결";

import type { SupportedLanguage } from "../../lib/i18n";
import { commonUi, formatDate, formatPrice, localizeCategoryName } from "../../lib/localizedUi";
import { useLanguage } from "../components/LanguageProvider";

interface RequestRecord {
  id: number;

  category: string;
  budget: number;
  preferred_area: string;
  symptom: string;
  created_at: string;
}

interface BidFormState {
  hospital_name: string;
  price: string;
  recommended_plan: string;
  reason: string;
  reservation: string;
}


const emptyBidState: BidFormState = {
  hospital_name: "",
  price: "",
  recommended_plan: "",
  reason: "",
  reservation: "",
};

const hospitalCopy = {
  ko: {
    nav: "Partner Center",
    eyebrow: "hospital center",
    title: ["요청을 고르고", "역제안합니다"],
    intro:
      "병원 관계자는 열린 요청을 선택해 상세 내용을 확인하고, 핏이 맞는 고객에게 추천 시술, 가격, 예약 안내를 제안합니다. 최종 버전에서는 관리자와 승인된 병원 계정만 접근하도록 권한을 분리합니다.",
    status: {
      openRequests: "open requests",
      selected: "selected",
      access: "access",
      proposalType: "proposal type",
      none: "none",
      loginActive: "login active",
      restricted: "restricted",
      reverseOffer: "reverse offer",
    },
    checking: "접근 권한을 확인하는 중입니다.",
    loginEyebrow: "restricted prototype",
    loginTitle: "병원 센터는 로그인이 필요합니다",
    loginBody:
      "지금은 프로토타입이라 로그인 여부만 확인합니다. 운영 버전에서는 병원 role, 관리자 role, 승인 상태를 나눠 요청 접근 범위를 제한합니다.",
    kakaoLogin: "카카오로 로그인",
    loadingRequests: "요청서를 불러오는 중입니다.",
    emptyEyebrow: "empty board",
    emptyTitle: "현재 열린 요청이 없습니다",
    emptyBody: "사용자가 견적 요청을 등록하면 이곳에 요청 카드가 쌓이고, 병원은 요청을 선택해 역제안을 보낼 수 있습니다.",
    boardEyebrow: "request board",
    boardTitle: "열린 요청",
    selectedEyebrow: "selected request",
    info: {
      requestId: "요청 번호",
      email: "고객 이메일",
      area: "선호 지역",
      date: "요청일",
      customerNote: "customer note",
      offerEyebrow: "write reverse offer",
      offerTitle: ["이 요청에 맞는", "병원 제안을 작성합니다"],
      offerBody: "시술 조합, 제안 이유, 예약 안내를 함께 작성해야 고객이 병원의 제안을 더 쉽게 비교할 수 있습니다.",
      hospitalName: "병원 이름",
      price: "가격(만원)",
      plan: "추천 시술 조합, 예: 울쎄라 300샷 + 리쥬란",
      reason: "제안 이유, 예: 예산 안에서 턱선 체감이 있으면서 다운타임 부담이 적은 조합입니다.",
      reservation: "예약 안내, 예: 상담 후 당일 진행 가능하며 원하는 시간대를 남겨주세요.",
      submit: "이 요청에 제안서 전송",
    },
    alerts: {
      loginFailPrefix: "로그인에 실패했어요.",
      missing: "병원명, 가격, 추천 시술, 제안 이유, 예약 안내를 모두 입력해주세요.",
      fail: "제안 전송에 실패했습니다.",
      success: "제안서가 고객에게 전송되었습니다.",
    },
  },
  en: {
    nav: "Partner Center",
    eyebrow: "hospital center",
    title: ["Choose requests", "and send offers"],
    intro:
      "Clinic staff can review open requests, then suggest a treatment plan, price, and booking guidance for users who fit their clinic.",
    status: {
      openRequests: "open requests",
      selected: "selected",
      access: "access",
      proposalType: "proposal type",
      none: "none",
      loginActive: "login active",
      restricted: "restricted",
      reverseOffer: "reverse offer",
    },
    checking: "Checking access permission.",
    loginEyebrow: "restricted prototype",
    loginTitle: "Clinic Center requires login",
    loginBody: "This prototype only checks login status. In production, hospital roles, admin roles, and approval status can control access.",
    kakaoLogin: "Log in with Kakao",
    loadingRequests: "Loading requests.",
    emptyEyebrow: "empty board",
    emptyTitle: "No open requests yet",
    emptyBody: "When users submit quote requests, cards will appear here and clinics can select one to send a reverse offer.",
    boardEyebrow: "request board",
    boardTitle: "Open requests",
    selectedEyebrow: "selected request",
    info: {
      requestId: "Request ID",
      email: "Customer email",
      area: "Preferred area",
      date: "Request date",
      customerNote: "customer note",
      offerEyebrow: "write reverse offer",
      offerTitle: ["Write a clinic offer", "for this request"],
      offerBody: "Add the treatment combination, reason, and booking guidance so the customer can compare clinic offers more easily.",
      hospitalName: "Clinic name",
      price: "Price, 10k KRW units",
      plan: "Recommended plan, e.g. Ultherapy 300 shots + Rejuran",
      reason: "Reason, e.g. A balanced plan within budget with visible jawline improvement and limited downtime.",
      reservation: "Booking guidance, e.g. Same-day treatment may be possible after consultation. Please leave preferred times.",
      submit: "Send offer for this request",
    },
    alerts: {
      loginFailPrefix: "Login failed.",
      missing: "Please enter clinic name, price, recommended treatment, reason, and booking guidance.",
      fail: "Could not send the offer.",
      success: "The offer has been sent to the customer.",
    },
  },
  zh: {
    nav: "医院中心",
    eyebrow: "医院中心",
    title: ["选择请求", "发送反向提案"],
    intro: "医院工作人员可以选择开放请求并查看详情，再向匹配的用户提出推荐项目、价格和预约说明。",
    status: {
      openRequests: "开放请求",
      selected: "已选择",
      access: "访问权限",
      proposalType: "提案类型",
      none: "无",
      loginActive: "已登录",
      restricted: "受限",
      reverseOffer: "反向提案",
    },
    checking: "正在确认访问权限。",
    loginEyebrow: "受限原型",
    loginTitle: "医院中心需要登录",
    loginBody: "当前原型只确认登录状态。正式版本可按医院角色、管理员角色和审核状态限制访问范围。",
    kakaoLogin: "用 Kakao 登录",
    loadingRequests: "正在加载请求书。",
    emptyEyebrow: "空白看板",
    emptyTitle: "当前没有开放请求",
    emptyBody: "用户提交报价请求后，这里会显示请求卡片，医院可以选择请求并发送反向提案。",
    boardEyebrow: "请求看板",
    boardTitle: "开放请求",
    selectedEyebrow: "已选择请求",
    info: {
      requestId: "请求编号",
      email: "客户邮箱",
      area: "偏好地区",
      date: "请求日期",
      customerNote: "客户备注",
      offerEyebrow: "填写反向提案",
      offerTitle: ["为此请求", "填写医院提案"],
      offerBody: "请一起填写项目组合、提案理由和预约说明，方便客户比较医院提案。",
      hospitalName: "医院名称",
      price: "价格，1万韩元单位",
      plan: "推荐项目组合，例如 Ultherapy 300发 + Rejuran",
      reason: "提案理由，例如 在预算内兼顾下颌线体感变化和较低恢复负担。",
      reservation: "预约说明，例如 咨询后当天可进行，请留下希望时间。",
      submit: "向此请求发送提案",
    },
    alerts: {
      loginFailPrefix: "登录失败。",
      missing: "请填写医院名、价格、推荐项目、提案理由和预约说明。",
      fail: "提案发送失败。",
      success: "提案已发送给客户。",
    },
  },
  ja: {
    nav: "クリニックセンター",
    eyebrow: "クリニックセンター",
    title: ["依頼を選び", "逆提案します"],
    intro: "クリニック担当者は公開中の依頼を選んで詳細を確認し、条件に合うユーザーへ推薦施術、価格、予約案内を提案できます。",
    status: {
      openRequests: "公開依頼",
      selected: "選択中",
      access: "アクセス",
      proposalType: "提案タイプ",
      none: "なし",
      loginActive: "ログイン中",
      restricted: "制限中",
      reverseOffer: "逆提案",
    },
    checking: "アクセス権限を確認中です。",
    loginEyebrow: "制限付きプロトタイプ",
    loginTitle: "クリニックセンターはログインが必要です",
    loginBody: "現在はプロトタイプのためログイン状態のみ確認します。運用版ではクリニック権限、管理者権限、承認状態でアクセス範囲を制御できます。",
    kakaoLogin: "Kakaoでログイン",
    loadingRequests: "依頼書を読み込み中です。",
    emptyEyebrow: "空のボード",
    emptyTitle: "現在公開中の依頼はありません",
    emptyBody: "ユーザーが見積依頼を登録するとここに依頼カードが表示され、クリニックは依頼を選んで逆提案できます。",
    boardEyebrow: "依頼ボード",
    boardTitle: "公開依頼",
    selectedEyebrow: "選択中の依頼",
    info: {
      requestId: "依頼番号",
      email: "顧客メール",
      area: "希望エリア",
      date: "依頼日",
      customerNote: "顧客メモ",
      offerEyebrow: "逆提案を作成",
      offerTitle: ["この依頼に合う", "クリニック提案を作成"],
      offerBody: "施術組み合わせ、提案理由、予約案内を一緒に書くと、顧客が提案を比較しやすくなります。",
      hospitalName: "クリニック名",
      price: "価格、1万KRW単位",
      plan: "推薦施術例: ウルセラ300ショット + リジュラン",
      reason: "提案理由例: 予算内でフェイスラインの変化を感じやすく、ダウンタイム負担が少ない組み合わせです。",
      reservation: "予約案内例: 相談後に当日施術も可能です。希望時間を残してください。",
      submit: "この依頼に提案を送信",
    },
    alerts: {
      loginFailPrefix: "ログインに失敗しました。",
      missing: "クリニック名、価格、推薦施術、提案理由、予約案内を入力してください。",
      fail: "提案を送信できませんでした。",
      success: "提案を顧客へ送信しました。",
    },
  },
  th: {
    nav: "ศูนย์คลินิก",
    eyebrow: "ศูนย์คลินิก",
    title: ["เลือกคำขอ", "แล้วส่งข้อเสนอ"],
    intro: "เจ้าหน้าที่คลินิกเลือกคำขอที่เปิดอยู่ ดูรายละเอียด แล้วเสนอหัตถการ ราคา และคำแนะนำการจองให้ลูกค้าที่เหมาะกับคลินิกได้",
    status: {
      openRequests: "คำขอที่เปิด",
      selected: "เลือกอยู่",
      access: "สิทธิ์เข้าถึง",
      proposalType: "ประเภทข้อเสนอ",
      none: "ไม่มี",
      loginActive: "เข้าสู่ระบบแล้ว",
      restricted: "จำกัด",
      reverseOffer: "ข้อเสนอจากคลินิก",
    },
    checking: "กำลังตรวจสอบสิทธิ์เข้าถึง",
    loginEyebrow: "ต้นแบบจำกัดสิทธิ์",
    loginTitle: "ต้องเข้าสู่ระบบเพื่อใช้ศูนย์คลินิก",
    loginBody: "ตอนนี้เป็นต้นแบบจึงตรวจเฉพาะสถานะล็อกอิน เวอร์ชันจริงสามารถแยกสิทธิ์ตามบทบาทคลินิก ผู้ดูแล และสถานะอนุมัติได้",
    kakaoLogin: "เข้าสู่ระบบด้วย Kakao",
    loadingRequests: "กำลังโหลดคำขอ",
    emptyEyebrow: "บอร์ดว่าง",
    emptyTitle: "ยังไม่มีคำขอที่เปิดอยู่",
    emptyBody: "เมื่อผู้ใช้ส่งคำขอราคา การ์ดคำขอจะแสดงที่นี่ และคลินิกสามารถเลือกเพื่อส่งข้อเสนอได้",
    boardEyebrow: "บอร์ดคำขอ",
    boardTitle: "คำขอที่เปิด",
    selectedEyebrow: "คำขอที่เลือก",
    info: {
      requestId: "เลขคำขอ",
      email: "อีเมลลูกค้า",
      area: "พื้นที่ที่ต้องการ",
      date: "วันที่ขอ",
      customerNote: "บันทึกลูกค้า",
      offerEyebrow: "เขียนข้อเสนอ",
      offerTitle: ["เขียนข้อเสนอคลินิก", "สำหรับคำขอนี้"],
      offerBody: "กรอกชุดหัตถการ เหตุผล และคำแนะนำการจอง เพื่อให้ลูกค้าเปรียบเทียบข้อเสนอจากคลินิกได้ง่ายขึ้น",
      hospitalName: "ชื่อคลินิก",
      price: "ราคา หน่วย 10k KRW",
      plan: "ชุดหัตถการที่แนะนำ เช่น Ultherapy 300 shots + Rejuran",
      reason: "เหตุผล เช่น ชุดที่ช่วยให้เห็นกรอบหน้าในงบประมาณและพักฟื้นไม่นาน",
      reservation: "คำแนะนำการจอง เช่น อาจทำได้ในวันเดียวหลังปรึกษา โปรดระบุเวลาที่สะดวก",
      submit: "ส่งข้อเสนอสำหรับคำขอนี้",
    },
    alerts: {
      loginFailPrefix: "เข้าสู่ระบบไม่สำเร็จ",
      missing: "โปรดกรอกชื่อคลินิก ราคา หัตถการที่แนะนำ เหตุผล และคำแนะนำการจอง",
      fail: "ส่งข้อเสนอไม่สำเร็จ",
      success: "ส่งข้อเสนอให้ลูกค้าแล้ว",
    },
  },
} satisfies Record<SupportedLanguage, unknown>;

export default function HospitalPage() {
  const { language } = useLanguage();
  const copy = hospitalCopy[language];
  const ui = commonUi[language];
  const english = language !== "ko";
  const connection = useQuoteConnection("/hospital");
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [inputs, setInputs] = useState<Record<number, BidFormState>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const request = requests.find((item) => item.id === selectedId) || requests[0];
  const values = request ? inputs[request.id] || emptyBidState : emptyBidState;

  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    async function load() {
      setRequests([]); setInputs({}); setLoaded(false); setError(""); setClinicName("");
      if (!connection.enabled || !connection.userId) return;
      setLoading(true);
      try {
        const response = await fetch("/api/partner-requests", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "요청을 불러오지 못했습니다.");
        if (current) { setRequests(data.requests || []); setClinicName(data.clinicName || ""); setLoaded(true); }
      } catch (reason) { if (current) setError(reason instanceof Error ? reason.message : "요청을 불러오지 못했습니다."); }
      finally { if (current) setLoading(false); }
    }
    void load();
    return () => { current = false; controller.abort(); };
  }, [connection.enabled, connection.userId, refresh]);

  function change(field: keyof BidFormState, value: string) {
    if (!request) return;
    setInputs((previous) => ({ ...previous, [request.id]: { ...(previous[request.id] || emptyBidState), [field]: value } }));
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request || submitting) return;
    setSubmitting(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/partner-bids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        request_id: request.id, price: values.price, plan: values.recommended_plan, reason: values.reason, reservation: values.reservation,
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.alerts.fail);
      setMessage(copy.alerts.success);
      setInputs((previous) => ({ ...previous, [request.id]: emptyBidState }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : copy.alerts.fail); }
    finally { setSubmitting(false); }
  }
  return <main className="shell py-8">
    <nav className="mb-8 flex items-center justify-between"><Link href="/" className="ghost-link">탱글</Link><span className="text-sm">{copy.nav}</span></nav>
    <section className="rounded-[32px] bg-white p-6 sm:p-9">
      <p className="eyebrow">{copy.eyebrow}</p><h1 className="type-section mt-4">{english ? "Clinic proposals" : "병원 제안 관리"}</h1>
      <p className="mt-4 type-copy">{english ? "Approved partner accounts can review open requests and send consultation plans. Signing in alone does not grant access." : "승인된 병원 계정에서 열린 요청을 확인하고 상담 계획을 제안합니다. 일반 회원 로그인으로는 고객 요청을 볼 수 없습니다."}</p>
      <div className="mt-6"><QuoteConnectionNotice {...connection} english={english} /></div>
      {(connection.error || error) && <p role="alert" className="mt-4 text-sm text-red-700">{connection.error || error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-emerald-800">{message}</p>}
      {connection.enabled && connection.checked && !connection.userId && <button onClick={() => void connection.login()} className="action-primary mt-5">{copy.kakaoLogin}</button>}
      {connection.enabled && connection.userId && <button disabled={loading || submitting} onClick={() => setRefresh((value) => value + 1)} className="action-secondary mt-5 disabled:opacity-50">{loading ? copy.loadingRequests : english ? "Refresh requests" : "요청 새로고침"}</button>}
    </section>
    {loaded && requests.length === 0 && <section className="mt-5 rounded-[28px] bg-white p-6"><h2 className="text-xl font-semibold">{copy.emptyTitle}</h2><p className="mt-3 type-copy">{copy.emptyBody}</p></section>}
    {connection.userId && loaded && request && <div className="mt-5 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <section className="rounded-[28px] bg-white p-5"><h2 className="text-xl font-semibold">{copy.boardTitle}</h2><p className="mt-2 text-xs text-[var(--color-muted)]">{english ? "Up to 100 latest requests" : "최근 100개 요청까지 표시"}</p>
        <div className="mt-5 space-y-3">{requests.map((item) => <button key={item.id} type="button" disabled={submitting} onClick={() => { setSelectedId(item.id); setMessage(""); setError(""); }} aria-pressed={request.id === item.id} className={`w-full rounded-2xl border p-4 text-left ${request.id === item.id ? "border-[var(--color-carbon)] bg-[var(--color-porcelain-gray)]" : "border-[var(--color-line)]"}`}>
          <p className="font-semibold">#{item.id} · {localizeCategoryName(item.category, language)}</p><p className="mt-2 text-sm">{formatPrice(item.budget, language)} · {item.preferred_area || ui.none}</p>
        </button>)}</div>
      </section>
      <section className="rounded-[28px] bg-white p-6 sm:p-8">
        <p className="text-sm text-[var(--color-muted)]">#{request.id} · {formatDate(request.created_at, language)}</p>
        <h2 className="mt-3 text-2xl font-semibold">{localizeCategoryName(request.category, language)} · {formatPrice(request.budget, language)}</h2>
        <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-[var(--color-porcelain-gray)] p-5 text-sm leading-7">{request.symptom}</p>
        <form onSubmit={submit} className="mt-6">
          <p className="text-sm font-semibold">{copy.info.hospitalName}: {clinicName || (english ? "Approved clinic name required" : "승인된 병원명 등록 필요")}</p>
          <fieldset disabled={submitting || !clinicName} className="mt-5 space-y-5">
            <label className="block space-y-2"><span className="text-sm font-semibold">{copy.info.price}</span><input type="number" value={values.price} onChange={(event) => change("price", event.target.value)} min="0.1" max="100000" step="0.1" inputMode="decimal" required className="field" /></label>
            <label className="block space-y-2"><span className="text-sm font-semibold">{english ? "Treatment plan" : "추천 시술 구성"}</span><textarea value={values.recommended_plan} onChange={(event) => change("recommended_plan", event.target.value)} maxLength={500} required rows={3} className="field" /></label>
            <label className="block space-y-2"><span className="text-sm font-semibold">{english ? "Reason for proposal" : "제안 이유"}</span><textarea value={values.reason} onChange={(event) => change("reason", event.target.value)} maxLength={1500} required rows={4} className="field" /></label>
            <label className="block space-y-2"><span className="text-sm font-semibold">{english ? "How to arrange a consultation" : "상담 연락 방법·예약 안내"}</span><textarea value={values.reservation} onChange={(event) => change("reservation", event.target.value)} maxLength={1000} required rows={3} className="field" placeholder={english ? "Official contact, price conditions, and next steps" : "공식 연락처, 가격 조건, 상담 진행 방법을 적어 주세요."} /></label>
          </fieldset>
          <button type="submit" disabled={submitting || !clinicName} className="action-primary mt-6 disabled:opacity-50">{submitting ? (english ? "Sending…" : "전송 중…") : copy.info.submit}</button>
        </form>
      </section>
    </div>}
  </main>;
}
