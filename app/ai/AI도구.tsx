"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../components/사이트헤더";
import { useLanguage } from "../components/LanguageProvider";
import { openTangleChat } from "../components/AI열기";
import type { QuestionSheet, ReviewCheck } from "@/lib/AI도구";

type Tool = "questions" | "review" | "translate";
type Text = Record<string, string>;

const copy = {
  eyebrow: { ko: "탱글 AI", en: "Tangle AI", zh: "Tangle AI", ja: "Tangle AI", th: "Tangle AI" },
  title: { ko: "광고 없이 데이터로 답하는\n탱글 AI", en: "Clinic consultation AI\nbuilt on ad-free data", zh: "基于无广告数据的\n医院咨询 AI", ja: "広告なしのデータで答える\nクリニック相談AI", th: "AI ปรึกษาคลินิก\nจากข้อมูลไร้โฆษณา" },
  intro: {
    ko: "탱글 AI는 탱글의 추천 메모와 시술 가격을 바탕으로 답해요. 상담 질문을 준비하고, 후기의 광고 신호를 살펴보고, 병원에서 쓸 한국어 문장을 만들 수 있어요.",
    en: "Tangle AI answers only from Tangle's ad-free clinic notes and reference prices. Prepare for your consultation, spot sponsored reviews and talk to Korean clinic staff in your language.",
    zh: "Tangle AI 只根据 Tangle 无广告的医院记录和参考价格回答。帮助您准备面诊、识别广告评价，并用您的语言与韩国医院沟通。",
    ja: "Tangle AI は広告のないクリニック記録と参考価格だけをもとに答えます。相談の準備、広告レビューの見分け、韓国のクリニックとの会話をサポートします。",
    th: "Tangle AI ตอบจากข้อมูลคลินิกและราคาอ้างอิงที่ไม่มีโฆษณาเท่านั้น ช่วยเตรียมตัวก่อนปรึกษา แยกรีวิวโฆษณา และสื่อสารกับคลินิกเกาหลีในภาษาของคุณ",
  },
  chat: { ko: "AI 상담 도우미", en: "AI consultation guide", zh: "AI 咨询助手", ja: "AI相談アシスタント", th: "ผู้ช่วยปรึกษา AI" },
  chatBody: { ko: "고민을 적으면 추천 병원·가격·시술 정보로 정리해 드려요.", en: "Describe your concern and get answers from Tangle's clinic and price data.", zh: "写下您的烦恼，我们用医院与价格数据为您整理。", ja: "悩みを書くと、クリニック・価格データで整理します。", th: "เล่าปัญหาของคุณ แล้วรับคำตอบจากข้อมูลคลินิกและราคา" },
  chatCta: { ko: "AI에게 물어보기", en: "Ask Tangle AI", zh: "问 AI", ja: "AIに聞く", th: "ถาม AI" },
  questions: { ko: "AI 상담 질문지", en: "AI question sheet", zh: "AI 面诊问题清单", ja: "AI相談質問リスト", th: "AI รายการคำถาม" },
  questionsBody: { ko: "시술과 고민을 적으면 상담 때 물어볼 질문과 체크리스트를 만들어요.", en: "Get a personal list of questions and checks to bring to your consultation.", zh: "生成面诊时要问的问题和检查清单。", ja: "相談で聞くべき質問とチェックリストを作ります。", th: "สร้างรายการคำถามและเช็กลิสต์สำหรับวันปรึกษา" },
  review: { ko: "AI 후기 광고 체크", en: "AI sponsored-review check", zh: "AI 广告评价检测", ja: "AI広告レビュー判定", th: "AI ตรวจรีวิวโฆษณา" },
  reviewBody: { ko: "블로그·카페 후기를 붙여 넣으면 체험단·광고일 가능성을 알려 드려요.", en: "Paste a review to see how likely it is sponsored or promotional.", zh: "粘贴评价，判断是否为体验团或广告。", ja: "レビューを貼り付けると、広告・体験団の可能性を判定します。", th: "วางรีวิวเพื่อดูว่ามีโอกาสเป็นโฆษณาแค่ไหน" },
  translate: { ko: "AI 병원 번역", en: "AI clinic interpreter", zh: "AI 医院翻译", ja: "AIクリニック通訳", th: "AI ล่ามคลินิก" },
  translateBody: { ko: "내 언어로 쓰면 병원 직원에게 보여줄 한국어 문장으로 바꿔 드려요.", en: "Write in your language and show the Korean sentence to clinic staff.", zh: "用您的语言输入，生成给医院工作人员看的韩语句子。", ja: "自分の言語で書くと、スタッフに見せる韓国語に翻訳します。", th: "พิมพ์ภาษาของคุณ แล้วแสดงประโยคภาษาเกาหลีให้เจ้าหน้าที่ดู" },
  treatment: { ko: "시술·수술 이름", en: "Treatment or surgery", zh: "项目或手术名称", ja: "施術・手術名", th: "ชื่อหัตถการหรือการผ่าตัด" },
  treatmentPh: { ko: "예: 코 재수술, 리쥬란, 임플란트", en: "e.g. rhinoplasty, Rejuran, Thermage", zh: "例：隆鼻、丽珠兰、热玛吉", ja: "例：鼻整形、リジュラン、サーマジ", th: "เช่น เสริมจมูก, Rejuran, Thermage" },
  concern: { ko: "고민이나 상황 (선택)", en: "Your concern or situation (optional)", zh: "您的烦恼或情况（选填）", ja: "悩みや状況（任意）", th: "ความกังวลหรือสถานการณ์ (ไม่บังคับ)" },
  concernPh: { ko: "예: 예전에 실리콘을 넣었고 콧대가 비뚤어 보여요. 회복 기간이 짧았으면 해요.", en: "e.g. I had silicone before and the bridge looks crooked. I fly home in 7 days.", zh: "例：以前放过硅胶，鼻梁看起来歪了。7天后回国。", ja: "例：以前シリコンを入れて鼻筋が曲がって見えます。7日後に帰国します。", th: "เช่น เคยใส่ซิลิโคนแล้วสันจมูกดูเบี้ยว จะบินกลับใน 7 วัน" },
  make: { ko: "질문지 만들기", en: "Create my sheet", zh: "生成清单", ja: "リストを作る", th: "สร้างรายการ" },
  reviewText: { ko: "후기 내용", en: "Review text", zh: "评价内容", ja: "レビュー本文", th: "ข้อความรีวิว" },
  reviewPh: { ko: "블로그·카페·SNS 후기를 그대로 붙여 넣어 주세요.", en: "Paste the review from a blog, forum or social media.", zh: "请粘贴博客、论坛或社交媒体上的评价。", ja: "ブログ・SNSのレビューを貼り付けてください。", th: "วางรีวิวจากบล็อกหรือโซเชียลมีเดีย" },
  check: { ko: "광고인지 확인하기", en: "Check this review", zh: "检测评价", ja: "判定する", th: "ตรวจรีวิว" },
  adChance: { ko: "광고·체험단 가능성", en: "Chance it is sponsored", zh: "广告可能性", ja: "広告の可能性", th: "โอกาสเป็นโฆษณา" },
  evidence: { ko: "근거", en: "Signals", zh: "依据", ja: "根拠", th: "สัญญาณ" },
  verify: { ko: "확인해 볼 것", en: "What to verify", zh: "建议确认", ja: "確認すること", th: "สิ่งที่ควรตรวจสอบ" },
  toKorean: { ko: "한국어로", en: "To Korean", zh: "译成韩语", ja: "韓国語へ", th: "เป็นภาษาเกาหลี" },
  fromKorean: { ko: "한국어를 내 언어로", en: "Korean to mine", zh: "韩语译成我的语言", ja: "韓国語を自分の言語へ", th: "เกาหลีเป็นภาษาฉัน" },
  translateText: { ko: "번역할 문장", en: "Text to translate", zh: "要翻译的句子", ja: "翻訳する文", th: "ข้อความที่จะแปล" },
  translatePh: { ko: "예: 마취에 알레르기가 있어요. 수술 후 7일 뒤에 비행기를 타요.", en: "e.g. I am allergic to anesthesia. I fly home 7 days after surgery.", zh: "例：我对麻醉过敏。术后7天坐飞机回国。", ja: "例：麻酔にアレルギーがあります。手術の7日後に飛行機に乗ります。", th: "เช่น ฉันแพ้ยาสลบ จะบินกลับ 7 วันหลังผ่าตัด" },
  translateBtn: { ko: "번역하기", en: "Translate", zh: "翻译", ja: "翻訳する", th: "แปล" },
  showStaff: { ko: "직원에게 보여주기", en: "Show to staff", zh: "给工作人员看", ja: "スタッフに見せる", th: "แสดงให้เจ้าหน้าที่" },
  meaning: { ko: "뜻 확인", en: "Meaning check", zh: "意思确认", ja: "意味の確認", th: "ตรวจความหมาย" },
  copy: { ko: "복사", en: "Copy", zh: "复制", ja: "コピー", th: "คัดลอก" },
  print: { ko: "인쇄·저장", en: "Print / save", zh: "打印/保存", ja: "印刷・保存", th: "พิมพ์/บันทึก" },
  aiTag: { ko: "탱글 AI 답변", en: "Tangle AI", zh: "Tangle AI", ja: "Tangle AI", th: "Tangle AI" },
  basicTag: { ko: "기본 안내 (AI 연결 대기 중)", en: "Basic guide (AI unavailable)", zh: "基础说明（AI 暂不可用）", ja: "基本案内（AI一時停止中）", th: "คำแนะนำพื้นฐาน (AI ไม่พร้อม)" },
  unavailable: { ko: "AI 번역이 잠시 쉬고 있어요. 외국인 안내의 한국어 직원 카드를 이용해 주세요.", en: "AI translation is unavailable right now. Please use the Korean staff card in the global guide.", zh: "AI 翻译暂不可用，请使用外国人指南中的韩语卡片。", ja: "AI翻訳は一時停止中です。外国人ガイドの韓国語カードをご利用ください。", th: "AI แปลภาษาไม่พร้อมใช้งานขณะนี้ โปรดใช้การ์ดภาษาเกาหลีในคู่มือ" },
  error: { ko: "잠시 후 다시 시도해 주세요.", en: "Please try again in a moment.", zh: "请稍后再试。", ja: "しばらくしてからお試しください。", th: "โปรดลองอีกครั้งในภายหลัง" },
  loading: { ko: "탱글 AI가 정리하는 중…", en: "Tangle AI is working…", zh: "Tangle AI 正在整理…", ja: "Tangle AI が作成中…", th: "Tangle AI กำลังทำงาน…" },
  privacy: {
    ko: "입력한 내용은 답변을 만들기 위해 OpenAI로 전송되고, 탱글은 저장하지 않아요. 이름·연락처는 적지 마세요. AI 답변은 참고용이며 진료를 대신하지 않아요.",
    en: "Your text is sent to OpenAI to generate the answer and is not stored by Tangle. Do not include personal details. AI answers are for reference, not medical advice.",
    zh: "您输入的内容会发送给 OpenAI 生成回答，Tangle 不会保存。请勿填写个人信息。AI 回答仅供参考，不能替代诊疗。",
    ja: "入力内容は回答作成のため OpenAI に送信され、Tangle は保存しません。個人情報は入力しないでください。AIの回答は参考情報で、診療の代わりにはなりません。",
    th: "ข้อความจะถูกส่งไปยัง OpenAI เพื่อสร้างคำตอบ และ Tangle จะไม่จัดเก็บ โปรดอย่าใส่ข้อมูลส่วนตัว คำตอบ AI เป็นข้อมูลอ้างอิง ไม่ใช่คำแนะนำทางการแพทย์",
  },
} satisfies Record<string, Text>;

async function post<T>(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    return { ok: response.ok, status: response.status, data: await response.json() };
  } finally {
    clearTimeout(timer);
  }
}

function SourceTag({ ai, L }: { ai: boolean; L: (text: Text) => string }) {
  return <p className={`text-[11px] font-bold tracking-wider ${ai ? "text-[var(--accent)]" : "text-[var(--color-muted)]"}`}>{ai ? `✦ ${L(copy.aiTag)}` : L(copy.basicTag)}</p>;
}

export default function AITools() {
  const { language } = useLanguage();
  const L = (text: Text) => text[language] ?? text.en;
  const [tool, setTool] = useState<Tool>("questions");

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "questions" || hash === "review" || hash === "translate") setTool(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (next: Tool) => {
    setTool(next);
    history.replaceState(null, "", `#${next}`);
  };

  const tabs: { id: Tool; title: Text; body: Text }[] = [
    { id: "questions", title: copy.questions, body: copy.questionsBody },
    { id: "review", title: copy.review, body: copy.reviewBody },
    { id: "translate", title: copy.translate, body: copy.translateBody },
  ];

  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />
      <section className="shell pb-8 pt-10 sm:pt-14" aria-labelledby="ai-title">
        <p className="eyebrow mb-5"><span className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>{L(copy.eyebrow)}</p>
        <h1 id="ai-title" className="type-title whitespace-pre-line">{L(copy.title)}</h1>
        <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[var(--color-muted)]">{L(copy.intro)}</p>
      </section>

      <section className="shell grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="AI tools">
        <button type="button" onClick={openTangleChat} className="rounded-[22px] bg-[var(--brand)] p-5 text-left text-white transition hover:opacity-95">
          <p className="text-[12px] font-bold tracking-wider text-white/70">01</p>
          <p className="mt-2 text-[18px] font-bold">{L(copy.chat)}</p>
          <p className="mt-2 text-[14px] leading-6 text-white/80">{L(copy.chatBody)}</p>
          <p className="mt-4 text-[14px] font-semibold">{L(copy.chatCta)} →</p>
        </button>
        {tabs.map((tab, index) => (
          <button key={tab.id} type="button" onClick={() => select(tab.id)} aria-pressed={tool === tab.id}
            className={`rounded-[22px] border p-5 text-left transition ${tool === tab.id ? "border-[var(--brand)] bg-white shadow-[0_10px_30px_rgba(23,58,49,0.08)]" : "border-[var(--color-silver-mist)] bg-white/60 hover:bg-white"}`}>
            <p className="text-[12px] font-bold tracking-wider text-[var(--accent)]">0{index + 2}</p>
            <p className="mt-2 text-[18px] font-bold text-[var(--color-carbon)]">{L(tab.title)}</p>
            <p className="mt-2 text-[14px] leading-6 text-[var(--color-muted)]">{L(tab.body)}</p>
          </button>
        ))}
      </section>

      <section className="shell mt-8">
        <div className="rounded-[28px] border border-[var(--color-silver-mist)] bg-white p-5 sm:p-8">
          {tool === "questions" && <QuestionTool L={L} language={language} />}
          {tool === "review" && <ReviewTool L={L} language={language} />}
          {tool === "translate" && <TranslateTool L={L} language={language} />}
          <p className="mt-6 border-t border-[var(--color-silver-mist)] pt-4 text-[12px] leading-6 text-[var(--color-muted)]">{L(copy.privacy)}</p>
        </div>
        <p className="mt-6 text-[14px] text-[var(--color-muted)]">
          <Link href="/clinics" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">추천 병원 →</Link>
          <span className="mx-3">·</span>
          <Link href="/global" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">Global guide →</Link>
        </p>
      </section>
    </main>
  );
}

type ToolProps = { L: (text: Text) => string; language: string };

function QuestionTool({ L, language }: ToolProps) {
  const [treatment, setTreatment] = useState("");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ sheet: QuestionSheet; ai: boolean } | null>(null);

  const submit = async () => {
    if (!treatment.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const { ok, data } = await post<{ sheet?: QuestionSheet; source?: string; error?: string }>("/api/ai/questions", { treatment, concern, language });
      if (!ok || !data.sheet) throw new Error(data.error);
      setResult({ sheet: data.sheet, ai: data.source === "ai" });
    } catch (err) {
      setError((err as Error).message || L(copy.error));
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-[22px] font-bold">{L(copy.questions)}</h2>
      <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="grid gap-2 text-[14px] font-semibold">{L(copy.treatment)}
          <input value={treatment} onChange={(event) => setTreatment(event.target.value)} maxLength={80} placeholder={L(copy.treatmentPh)} className="field" required />
        </label>
        <label className="grid gap-2 text-[14px] font-semibold">{L(copy.concern)}
          <textarea value={concern} onChange={(event) => setConcern(event.target.value)} maxLength={600} rows={3} placeholder={L(copy.concernPh)} className="field" />
        </label>
        <button type="submit" disabled={loading || !treatment.trim()} className="action-primary w-full sm:w-auto disabled:opacity-50">{loading ? L(copy.loading) : L(copy.make)}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-[14px] text-[var(--accent)]">{error}</p>}
      {result && (
        <article className="mt-8 rounded-[22px] bg-[var(--cream)] p-5 sm:p-7 print:bg-white">
          <SourceTag ai={result.ai} L={L} />
          <h3 className="mt-2 text-[20px] font-bold">{result.sheet.title}</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {result.sheet.sections.map((section) => (
              <section key={section.heading}>
                <h4 className="text-[15px] font-bold text-[var(--brand)]">{section.heading}</h4>
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2 text-[14px] leading-6"><span aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 rounded border border-[var(--brand)]" />{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <button type="button" onClick={() => window.print()} className="action-secondary mt-6 print:hidden">{L(copy.print)}</button>
        </article>
      )}
    </div>
  );
}

function ReviewTool({ L, language }: ToolProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ check: ReviewCheck; ai: boolean } | null>(null);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const { ok, data } = await post<{ result?: ReviewCheck; source?: string; error?: string }>("/api/ai/review-check", { text, language });
      if (!ok || !data.result) throw new Error(data.error);
      setResult({ check: data.result, ai: data.source === "ai" });
    } catch (err) {
      setError((err as Error).message || L(copy.error));
    } finally { setLoading(false); }
  };

  const score = result?.check.score ?? 0;
  const tone = score >= 60 ? "bg-[var(--accent)]" : score >= 35 ? "bg-amber-400" : "bg-[var(--brand)]";

  return (
    <div>
      <h2 className="text-[22px] font-bold">{L(copy.review)}</h2>
      <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="grid gap-2 text-[14px] font-semibold">{L(copy.reviewText)}
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={3000} rows={7} placeholder={L(copy.reviewPh)} className="field" required />
        </label>
        <p className="-mt-2 text-right text-[12px] text-[var(--color-muted)]">{text.length} / 3000</p>
        <button type="submit" disabled={loading || !text.trim()} className="action-primary w-full sm:w-auto disabled:opacity-50">{loading ? L(copy.loading) : L(copy.check)}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-[14px] text-[var(--accent)]">{error}</p>}
      {result && (
        <article className="mt-8 rounded-[22px] bg-[var(--cream)] p-5 sm:p-7">
          <SourceTag ai={result.ai} L={L} />
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-[20px] font-bold">{result.check.verdict}</p>
            <p className="shrink-0 text-[13px] text-[var(--color-muted)]">{L(copy.adChance)} <strong className="text-[28px] text-[var(--color-carbon)]">{score}</strong>%</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={L(copy.adChance)}>
            <div className={`h-full rounded-full ${tone}`} style={{ width: `${score}%` }} />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <section>
              <h3 className="text-[15px] font-bold text-[var(--brand)]">{L(copy.evidence)}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-6">{result.check.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
            </section>
            <section>
              <h3 className="text-[15px] font-bold text-[var(--brand)]">{L(copy.verify)}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-6">{result.check.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </section>
          </div>
        </article>
      )}
    </div>
  );
}

function TranslateTool({ L, language }: ToolProps) {
  const [direction, setDirection] = useState<"toKorean" | "fromKorean">("toKorean");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ translated: string; check: string } | null>(null);
  const [big, setBig] = useState(false);

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const { ok, status, data } = await post<{ translated?: string; check?: string; error?: string }>("/api/ai/translate", { text, language, direction });
      if (status === 503) { setError(L(copy.unavailable)); return; }
      if (!ok || !data.translated) throw new Error(data.error);
      setResult({ translated: data.translated, check: data.check ?? "" });
    } catch (err) {
      const message = (err as Error).message;
      setError(message && message !== "rate_limited" ? message : L(copy.error));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!big) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setBig(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [big]);

  return (
    <div>
      <h2 className="text-[22px] font-bold">{L(copy.translate)}</h2>
      <div className="mt-5 inline-flex rounded-full border border-[var(--color-silver-mist)] p-1" role="group">
        {(["toKorean", "fromKorean"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={direction === value} onClick={() => { setDirection(value); setResult(null); }}
            className={`rounded-full px-4 py-2 text-[14px] font-semibold ${direction === value ? "bg-[var(--brand)] text-white" : "text-[var(--color-muted)]"}`}>{L(copy[value])}</button>
        ))}
      </div>
      <form className="mt-4 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label className="grid gap-2 text-[14px] font-semibold">{L(copy.translateText)}
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={600} rows={4} placeholder={direction === "toKorean" ? L(copy.translatePh) : "예: 수술 후 3일 동안 세안하지 마세요."} className="field" required />
        </label>
        <button type="submit" disabled={loading || !text.trim()} className="action-primary w-full sm:w-auto disabled:opacity-50">{loading ? L(copy.loading) : L(copy.translateBtn)}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-[14px] text-[var(--accent)]">{error} {error === L(copy.unavailable) && <Link href="/global" className="font-semibold underline">/global</Link>}</p>}
      {result && (
        <article className="mt-8 rounded-[22px] bg-[var(--cream)] p-5 sm:p-7">
          <SourceTag ai L={L} />
          <p lang={direction === "toKorean" ? "ko" : language} className="mt-3 whitespace-pre-wrap text-[22px] font-bold leading-9">{result.translated}</p>
          {result.check && <p className="mt-3 text-[14px] leading-6 text-[var(--color-muted)]"><strong>{L(copy.meaning)}:</strong> {result.check}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {direction === "toKorean" && <button type="button" onClick={() => setBig(true)} className="action-primary">{L(copy.showStaff)}</button>}
            <button type="button" onClick={() => void navigator.clipboard?.writeText(result.translated)} className="action-secondary">{L(copy.copy)}</button>
          </div>
        </article>
      )}
      {big && result && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-white p-6" onClick={() => setBig(false)}>
          <p lang="ko" className="max-w-3xl whitespace-pre-wrap text-center text-[clamp(28px,6vw,52px)] font-bold leading-tight text-[var(--color-carbon)]">{result.translated}</p>
          <button type="button" aria-label="close" className="absolute right-5 top-5 h-11 w-11 rounded-full bg-[var(--cream)] text-xl">✕</button>
        </div>
      )}
    </div>
  );
}
