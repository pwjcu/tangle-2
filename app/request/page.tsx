"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteConnectionNotice, useQuoteConnection } from "../components/견적연결";
import type { SupportedLanguage } from "../../lib/i18n";
import { commonUi, localizeCategoryName } from "../../lib/localizedUi";
import { treatmentCategories } from "../../lib/siteContent";
import { useLanguage } from "../components/LanguageProvider";

const requestCopy: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string[];
    intro: string;
    cards: string[];
    labels: Record<string, string>;
    placeholders: Record<string, string>;
    submit: string;
    submitting: string;
    fromRecommendation: string;
    concern: string;
    recommended: string;
    tips: { title: string; body: string }[];
    alerts: { required: string; fail: string; success: string };
  }
> = {
  ko: {
    eyebrow: "request quote",
    title: ["병원 제안을 받을", "요청서를 만듭니다"],
    intro: "병원은 이 요청서를 보고 가격뿐 아니라 추천 시술, 제안 이유, 예약 안내를 함께 작성합니다. 사용자는 반복 상담 없이 조건이 맞는 병원을 먼저 비교할 수 있습니다.",
    cards: ["예산과 카테고리", "실제 고민 문장", "선호 지역", "피하고 싶은 조건"],
    labels: {
      email: "contact email",
      category: "category",
      budget: "budget, 만원",
      area: "preferred area",
      concern: "concern and request",
      other: "기타",
    },
    placeholders: {
      budget: "예: 120",
      area: "예: 강남, 성수, 분당",
      concern: "예: 얼굴 처짐과 팔자 라인이 고민입니다. 자연스럽지만 체감이 있는 조합을 원하고, 다운타임은 길지 않았으면 좋겠습니다.",
    },
    submit: "견적 요청 등록",
    submitting: "요청 등록 중",
    fromRecommendation: "from recommendation",
    concern: "고민",
    recommended: "추천 시술",
    tips: [
      { title: "좋은 요청서", body: "원하는 변화, 예산 상한, 회복 가능 시간을 명확히 적을수록 병원 제안이 좋아집니다." },
      { title: "비교 기준", body: "추천 이유, 시술 조합, 예약 안내, 회복 조건을 함께 비교하세요." },
      { title: "다음 단계", body: "제안이 도착하면 받은 제안함에서 병원별 내용을 한 번에 비교할 수 있습니다." },
    ],
    alerts: {
      required: "이메일, 예산, 고민 내용을 입력해주세요.",
      fail: "요청 등록에 실패했어요. 잠시 후 다시 시도해주세요.",
      success: "견적 요청이 등록되었습니다. 제안이 도착하면 받은 제안함에서 비교할 수 있어요.",
    },
  },
  en: {
    eyebrow: "request quote",
    title: ["Create a request", "for clinic offers"],
    intro: "Clinics use this request to write price, recommended treatment, reason, and booking guidance. You can compare fitting clinics without repeating the same consultation.",
    cards: ["Budget and category", "Real concern sentence", "Preferred area", "Conditions to avoid"],
    labels: { email: "contact email", category: "category", budget: "budget, 10k KRW units", area: "preferred area", concern: "concern and request", other: "Other" },
    placeholders: {
      budget: "e.g. 120",
      area: "e.g. Gangnam, Seongsu, Bundang",
      concern: "e.g. I am worried about facial sagging and smile lines. I want a natural but noticeable combination with limited downtime.",
    },
    submit: "Submit quote request",
    submitting: "Submitting...",
    fromRecommendation: "from recommendation",
    concern: "Concern",
    recommended: "Recommended",
    tips: [
      { title: "Good request", body: "Clinic offers improve when desired change, max budget, and recovery time are clear." },
      { title: "Comparison criteria", body: "Compare reason, treatment combination, booking guidance, and recovery conditions together." },
      { title: "Next step", body: "When offers arrive, you can compare them by clinic in your offer inbox." },
    ],
    alerts: {
      required: "Please enter email, budget, and concern.",
      fail: "The request could not be submitted. Please try again shortly.",
      success: "Your quote request has been submitted. Compare offers in your inbox when they arrive.",
    },
  },
  zh: {
    eyebrow: "申请报价",
    title: ["创建可接收", "医院提案的请求"],
    intro: "医院会根据请求书填写价格、推荐项目、提案理由和预约说明。用户无需重复咨询即可先比较合适的医院。",
    cards: ["预算和类别", "真实烦恼描述", "偏好地区", "想避开的条件"],
    labels: { email: "联系邮箱", category: "项目类别", budget: "预算，1万韩元单位", area: "偏好地区", concern: "烦恼和请求", other: "其他" },
    placeholders: { budget: "例如：120", area: "例如：江南、圣水、盆唐", concern: "例如：我在意脸部下垂和法令纹，希望自然但有体感变化，恢复期不要太长。" },
    submit: "提交报价请求",
    submitting: "正在提交",
    fromRecommendation: "来自推荐",
    concern: "烦恼",
    recommended: "推荐项目",
    tips: [
      { title: "好的请求书", body: "越清楚写出想要的变化、预算上限和可接受恢复时间，医院提案越准确。" },
      { title: "比较标准", body: "一起比较推荐理由、项目组合、预约说明和恢复条件。" },
      { title: "下一步", body: "提案到达后，可在收件箱中一次比较各医院内容。" },
    ],
    alerts: { required: "请输入邮箱、预算和烦恼内容。", fail: "请求提交失败，请稍后再试。", success: "报价请求已提交。提案到达后可在收件箱比较。" },
  },
  ja: {
    eyebrow: "見積依頼",
    title: ["クリニック提案を受ける", "依頼書を作成します"],
    intro: "クリニックはこの依頼書を見て、価格、推薦施術、提案理由、予約案内を作成します。繰り返し相談せずに条件が合うクリニックを比較できます。",
    cards: ["予算とカテゴリ", "実際の悩み文", "希望エリア", "避けたい条件"],
    labels: { email: "連絡用メール", category: "カテゴリ", budget: "予算、1万KRW単位", area: "希望エリア", concern: "悩みと依頼内容", other: "その他" },
    placeholders: { budget: "例: 120", area: "例: 江南、聖水、盆唐", concern: "例: 顔のたるみとほうれい線が気になります。自然だけど実感のある組み合わせで、ダウンタイムは長くない方が良いです。" },
    submit: "見積依頼を登録",
    submitting: "登録中",
    fromRecommendation: "推薦から",
    concern: "悩み",
    recommended: "推薦施術",
    tips: [
      { title: "良い依頼書", body: "望む変化、予算上限、回復可能時間を明確に書くほど提案が良くなります。" },
      { title: "比較基準", body: "推薦理由、施術組み合わせ、予約案内、回復条件を一緒に比較してください。" },
      { title: "次の段階", body: "提案が届いたら、受信箱でクリニック別に比較できます。" },
    ],
    alerts: { required: "メール、予算、悩みを入力してください。", fail: "依頼登録に失敗しました。少し後でもう一度お試しください。", success: "見積依頼を登録しました。提案が届いたら受信箱で比較できます。" },
  },
  th: {
    eyebrow: "ขอใบเสนอราคา",
    title: ["สร้างคำขอ", "เพื่อรับข้อเสนอจากคลินิก"],
    intro: "คลินิกจะใช้คำขอนี้เพื่อเขียนราคา หัตถการที่แนะนำ เหตุผล และคำแนะนำการจอง ผู้ใช้จึงเปรียบเทียบคลินิกที่เหมาะได้โดยไม่ต้องปรึกษาซ้ำ",
    cards: ["งบและหมวด", "ประโยคปัญหาจริง", "พื้นที่ที่ต้องการ", "เงื่อนไขที่อยากเลี่ยง"],
    labels: { email: "อีเมลติดต่อ", category: "หมวด", budget: "งบประมาณ, หน่วย 10k KRW", area: "พื้นที่ที่ต้องการ", concern: "ปัญหาและคำขอ", other: "อื่นๆ" },
    placeholders: { budget: "เช่น 120", area: "เช่น Gangnam, Seongsu, Bundang", concern: "เช่น กังวลเรื่องหน้าหย่อนและร่องแก้ม ต้องการชุดที่ธรรมชาติแต่รู้สึกได้ และไม่อยากพักฟื้นนาน" },
    submit: "ส่งคำขอราคา",
    submitting: "กำลังส่ง",
    fromRecommendation: "จากคำแนะนำ",
    concern: "ปัญหา",
    recommended: "หัตถการที่แนะนำ",
    tips: [
      { title: "คำขอที่ดี", body: "ระบุการเปลี่ยนแปลงที่ต้องการ งบสูงสุด และเวลาพักฟื้นให้ชัด เพื่อให้ข้อเสนอแม่นขึ้น" },
      { title: "เกณฑ์เปรียบเทียบ", body: "เปรียบเทียบเหตุผล ชุดหัตถการ คำแนะนำการจอง และเงื่อนไขพักฟื้นร่วมกัน" },
      { title: "ขั้นต่อไป", body: "เมื่อข้อเสนอมาถึง คุณสามารถเปรียบเทียบตามคลินิกได้ในกล่องข้อเสนอ" },
    ],
    alerts: { required: "โปรดกรอกอีเมล งบประมาณ และปัญหา", fail: "ส่งคำขอไม่สำเร็จ โปรดลองอีกครั้งภายหลัง", success: "ส่งคำขอราคาแล้ว เมื่อข้อเสนอมาถึงสามารถเปรียบเทียบในกล่องข้อเสนอได้" },
  },
};

const draftKey = "tangle-quote-login-draft-v1";
const initialForm = { category: "리프팅", budget: "", preferred_area: "서울", symptom: "" };

export default function RequestPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = requestCopy[language];
  const ui = commonUi[language];
  const english = language !== "ko";
  const connection = useQuoteConnection("/request");
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const next = { ...initialForm,
      category: category && [...treatmentCategories.map((item) => item.name), "기타"].includes(category) ? category : initialForm.category,
      budget: (params.get("budget") || "").slice(0, 10),
      symptom: (params.get("symptom") || params.get("recommended") || "").slice(0, 2000),
    };
    try {
      const stored = sessionStorage.getItem(draftKey);
      sessionStorage.removeItem(draftKey);
      if (stored) {
        const draft = JSON.parse(stored);
        if (Date.now() - draft.savedAt < 10 * 60 * 1000 && draft.form &&
          Object.keys(initialForm).every((key) => typeof draft.form[key] === "string")) Object.assign(next, draft.form);
      }
    } catch { /* Storage is optional; the form still works. */ }
    // Query prefill is read only after hydration; personal concern text is then removed from the address bar.
    window.history.replaceState(null, "", "/request" + (params.has("auth_error") ? "?auth_error=1" : ""));
    queueMicrotask(() => setFormData(next));
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }
  async function login() {
    try { sessionStorage.setItem(draftKey, JSON.stringify({ savedAt: Date.now(), form: formData })); }
    catch { setError(english ? "Your browser could not keep the draft during login. Copy it first." : "로그인 중 초안을 보관할 수 없는 브라우저입니다. 먼저 메모를 복사해 주세요."); return; }
    await connection.login();
  }
  async function copyNotes() {
    const text = `${english ? "Consultation notes" : "탱글 상담 준비 메모"}\n${formData.category}\n${english ? "Budget (10,000 KRW)" : "예산(만원)"}: ${formData.budget || "미정"}\n${formData.preferred_area}\n${formData.symptom}`;
    try { await navigator.clipboard.writeText(text); setMessage(english ? "Copied. No request has been sent." : "메모를 복사했어요. 병원에 전송된 요청은 아닙니다."); }
    catch { setError(english ? "Copy is unavailable. Select and copy the text in the fields." : "자동 복사를 사용할 수 없습니다. 입력란의 내용을 직접 선택해 복사해 주세요."); }
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(""); setMessage("");
    if (!connection.enabled || !connection.userId) { setError(english ? "Sign in when quote delivery is available." : "견적 전송이 열리면 로그인 후 요청할 수 있습니다."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, consent }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || copy.alerts.fail);
      try { sessionStorage.removeItem(draftKey); } catch { /* Optional storage. */ }
      router.push("/my");
    } catch (reason) { setError(reason instanceof Error ? reason.message : copy.alerts.fail); }
    finally { setLoading(false); }
  }
  return <main className="shell py-8">
    <nav className="mb-8 flex items-center justify-between gap-4" aria-label={english ? "Request navigation" : "요청 메뉴"}>
      <Link href="/" className="ghost-link">탱글</Link>
      <Link href="/my" className="action-secondary">{english ? "My requests" : "내 견적함"}</Link>
    </nav>
    <section className="rounded-[32px] bg-white p-6 sm:p-9">
      <p className="eyebrow">{english ? "CONSULTATION NOTES" : "상담 준비"}</p>
      <h1 className="type-section mt-4">{english ? "Organize your consultation" : "원하는 변화를 정리해 보세요"}</h1>
      <p className="mt-4 type-copy">{english ? "Compare your budget, goals, recovery time, and questions before contacting a clinic." : "예산과 고민, 회복에 쓸 수 있는 시간을 정리해 두면 병원 상담과 제안 비교가 쉬워져요."}</p>
      <div className="mt-6"><QuoteConnectionNotice {...connection} english={english} /></div>
    </section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 sm:p-8">
        {connection.enabled && <div className="mb-6 rounded-2xl bg-[var(--color-porcelain-gray)] p-4">
          {connection.userId ? <p className="text-sm">{english ? "Request account" : "요청 계정"}: {connection.email || (english ? "Email missing" : "이메일 없음")}</p> : <button type="button" onClick={() => void login()} className="action-secondary">{english ? "Log in with Kakao" : "초안을 유지하고 카카오 로그인"}</button>}
        </div>}
        <fieldset disabled={loading} className="grid gap-6 sm:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-semibold">{english ? copy.labels.category : "시술 카테고리"}</span>
            <select name="category" value={formData.category} onChange={handleChange} className="field" required>
              {treatmentCategories.map((category) => <option key={category.name} value={category.name}>{localizeCategoryName(category.name, language)}</option>)}
              <option value="기타">{copy.labels.other}</option>
            </select>
          </label>
          <label className="space-y-2"><span className="text-sm font-semibold">{english ? copy.labels.budget : "예산 상한 (만원)"}</span>
            <input type="number" name="budget" value={formData.budget} onChange={handleChange} min="0.1" max="100000" step="0.1" inputMode="decimal" required className="field" placeholder="예: 120" />
          </label>
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">{english ? copy.labels.area : "선호 지역"}</span>
            <input name="preferred_area" value={formData.preferred_area} onChange={handleChange} maxLength={100} required className="field" placeholder={english ? "e.g. Seoul Gangnam, Seongsu" : "예: 서울 강남, 성수"} />
          </label>
          <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">{english ? copy.labels.concern : "고민과 확인하고 싶은 점"}</span>
            <textarea name="symptom" value={formData.symptom} onChange={handleChange} minLength={5} maxLength={2000} rows={7} required className="field resize-y" placeholder={copy.placeholders.concern} />
            <span className="block text-right text-xs text-[var(--color-muted)]">{formData.symptom.length}/2000</span>
          </label>
        </fieldset>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{english ? "Include only what is needed for a first consultation. Do not enter phone numbers or identity documents here." : "첫 상담에 필요한 고민만 적어 주세요. 전화번호나 신분증 정보는 입력하지 않아도 됩니다."}</p>
        {connection.enabled && <label className="mt-5 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1" />
          <span>{english ? "I agree to share these consultation notes with approved partner clinics for quote proposals." : "견적 제안을 받기 위해 이 상담 내용을 승인된 병원 계정에 공유하는 데 동의합니다."}</span>
        </label>}
        {(error || connection.error) && <p role="alert" className="mt-4 text-sm text-red-700">{error || connection.error}</p>}
        {message && <p role="status" className="mt-4 text-sm text-emerald-800">{message}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => void copyNotes()} className="action-secondary">{english ? "Copy notes" : "상담 메모 복사"}</button>
          {connection.enabled && <button type="submit" disabled={loading || !connection.userId || !connection.email} className="action-primary disabled:opacity-50">{loading ? copy.submitting : copy.submit}</button>}
        </div>
      </form>
      <aside className="space-y-4">
        {copy.tips.slice(0, 2).map((tip) => <section key={tip.title} className="rounded-[28px] bg-white p-6"><h2 className="text-xl font-semibold">{tip.title}</h2><p className="mt-3 type-copy">{tip.body}</p></section>)}
        <section className="rounded-[28px] bg-[var(--color-porcelain-gray)] p-6"><h2 className="text-xl font-semibold">{english ? "Explore Seoul clinics" : "서울 추천 기록도 함께 확인"}</h2><p className="mt-3 type-copy">{english ? "Personal experience records help prepare questions. Verify the current clinic and doctor before contacting them." : "경험 기반 추천 기록에서 시술별 병원과 원장님을 살펴보고, 현재 소속과 진료 여부를 확인해 보세요."}</p><Link href="/clinics" className="action-secondary mt-5">{english ? "Browse records" : "서울 추천 보기"} {ui.open}</Link></section>
      </aside>
    </div>
  </main>;
}
