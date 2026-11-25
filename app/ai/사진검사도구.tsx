"use client";

import { useEffect, useState } from "react";
import { inspectPhoto, type PhotoCheck } from "@/lib/사진검사";

type Text = Record<string, string>;
type AIResult = { ai_generated: number; retouched: number; verdict: string; signals: string[] };

const t = {
  pick: { ko: "후기 사진 고르기", en: "Choose a review photo", zh: "选择评价照片", ja: "レビュー写真を選ぶ", th: "เลือกรูปรีวิว" },
  local: { ko: "사진은 서버로 보내지 않고, 이 기기 안에서 숨은 정보만 읽어요.", en: "The photo stays on your device. Only its hidden metadata is read here.", zh: "照片不会上传，只在本机读取隐藏信息。", ja: "写真は送信せず、この端末で隠れた情報だけを読みます。", th: "รูปจะไม่ถูกส่งออก อ่านเฉพาะข้อมูลแฝงในเครื่องนี้" },
  traces: { ko: "AI·보정 흔적", en: "AI / retouch traces", zh: "AI·修图痕迹", ja: "AI・加工の痕跡", th: "ร่องรอย AI/รีทัช" },
  deeper: { ko: "AI로 한 번 더 보기", en: "Ask AI to look closer", zh: "让 AI 再看一次", ja: "AIでもう一度見る", th: "ให้ AI ดูอีกครั้ง" },
  consent: { ko: "작게 줄인 사진 1장을 OpenAI로 보내는 데 동의해요. 탱글은 저장하지 않아요.", en: "I agree to send one downsized copy to OpenAI. Tangle does not store it.", zh: "同意将缩小后的照片发送给 OpenAI，Tangle 不保存。", ja: "縮小した写真1枚を OpenAI に送ることに同意します。Tangle は保存しません。", th: "ยินยอมส่งรูปย่อ 1 รูปไปยัง OpenAI โดย Tangle ไม่จัดเก็บ" },
  aiGen: { ko: "AI 생성 가능성", en: "AI-generated", zh: "AI 生成可能性", ja: "AI生成の可能性", th: "โอกาสสร้างด้วย AI" },
  retouch: { ko: "과한 보정 가능성", en: "Heavy retouching", zh: "过度修图可能性", ja: "過度な加工の可能性", th: "โอกาสรีทัชหนัก" },
  unavailable: { ko: "AI 사진 분석이 잠시 쉬고 있어요. 위의 숨은 정보 결과를 참고해 주세요.", en: "AI photo analysis is unavailable right now. Please use the metadata result above.", zh: "AI 照片分析暂不可用，请参考上方结果。", ja: "AI写真分析は一時停止中です。上の結果をご参照ください。", th: "AI วิเคราะห์รูปไม่พร้อมใช้งาน โปรดดูผลด้านบน" },
  note: { ko: "숨은 정보는 지우거나 바꿀 수 있어서, 흔적이 없다고 진짜라는 뜻은 아니에요. 전후 사진은 같은 조명·각도인지도 함께 보세요.", en: "Metadata can be removed or edited, so no traces does not prove a photo is real. Also compare lighting and angles in before/after photos.", zh: "隐藏信息可被删除或修改，没有痕迹不代表一定真实。也请比较前后照片的光线和角度。", ja: "メタデータは削除・変更できるため、痕跡がなくても本物とは限りません。前後写真の照明や角度も比べてください。", th: "ข้อมูลแฝงลบหรือแก้ได้ การไม่มีร่องรอยไม่ได้แปลว่าเป็นของจริง โปรดเทียบแสงและมุมของรูปก่อน-หลังด้วย" },
} satisfies Record<string, Text>;

const levelColor = { high: "bg-[var(--accent)]", mid: "bg-amber-400", low: "bg-[var(--brand)]", info: "bg-[#b8c0b9]" } as const;

/** 사진을 긴 변 768px JPEG로 줄입니다. 원본 메타데이터는 함께 지워집니다. */
async function downscale(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 768 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function PhotoTool({ L, language }: { L: (text: Text) => string; language: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [check, setCheck] = useState<PhotoCheck | null>(null);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ai, setAI] = useState<AIResult | null>(null);
  const [aiError, setAIError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = async (next: File | undefined) => {
    setCheck(null); setAI(null); setAIError(""); setError("");
    if (!next) return;
    if (!next.type.startsWith("image/") || next.size > 25 * 1024 * 1024) { setError("25MB 이하의 사진 파일을 골라 주세요."); return; }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    try {
      const bytes = new Uint8Array(await next.arrayBuffer());
      const bitmap = await createImageBitmap(next).catch(() => null);
      setCheck(inspectPhoto(bytes, next.type, bitmap?.width ?? 0, bitmap?.height ?? 0));
      bitmap?.close();
    } catch {
      setError("사진을 읽지 못했어요. 다른 사진으로 해 보세요.");
    }
  };

  const askAI = async () => {
    if (!file || !consent || loading) return;
    setLoading(true); setAIError("");
    try {
      const image = await downscale(file);
      const response = await fetch("/api/ai/photo-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, consent, language }) });
      const data = await response.json();
      if (response.status === 503) { setAIError(L(t.unavailable)); return; }
      if (!response.ok || !data.result) throw new Error(data.error);
      setAI(data.result);
    } catch (err) {
      const message = (err as Error).message;
      setAIError(message && message !== "rate_limited" ? message : L(t.unavailable));
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-[#cfdcc9] bg-[var(--cream)] px-6 py-10 text-center hover:border-[var(--brand)]">
        <span className="text-[16px] font-bold text-[var(--brand)]">{L(t.pick)}</span>
        <span className="text-[13px] text-[var(--color-muted)]">{L(t.local)}</span>
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => void pick(event.target.files?.[0])} />
      </label>
      {error && <p role="alert" className="mt-4 text-[14px] text-[var(--accent)]">{error}</p>}

      {check && (
        <article className="mt-6 grid gap-6 rounded-[22px] bg-[var(--cream)] p-5 sm:grid-cols-[180px_1fr] sm:p-7">
          {/* 사용자가 고른 로컬 사진 미리보기라 next/image 최적화 대상이 아닙니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="aspect-square w-full rounded-2xl object-cover sm:w-[180px]" />
          <div>
            <p className="text-[13px] text-[var(--color-muted)]">{L(t.traces)} <strong className="text-[24px] text-[var(--color-carbon)]">{check.score}</strong>%</p>
            <p className="mt-1 text-[20px] font-bold">{check.verdict}</p>
            <ul className="mt-4 space-y-2">
              {check.signals.map((signal) => <li key={signal.text} className="flex gap-2.5 text-[14px] leading-6"><span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full ${levelColor[signal.level]}`} />{signal.text}</li>)}
            </ul>
            <div className="mt-6 border-t border-[var(--color-silver-mist)] pt-5">
              <label className="flex cursor-pointer gap-2.5 text-[13px] leading-6 text-[var(--color-muted)]">
                <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" checked={consent} onChange={(event) => setConsent(event.target.checked)} />{L(t.consent)}
              </label>
              <button type="button" disabled={!consent || loading} onClick={() => void askAI()} className="action-secondary mt-3 disabled:opacity-40">{loading ? "…" : `✦ ${L(t.deeper)}`}</button>
              {aiError && <p role="alert" className="mt-3 text-[13px] text-[var(--accent)]">{aiError}</p>}
              {ai && (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-[11px] font-bold tracking-wider text-[var(--accent)]">✦ TANGLE AI</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-[13px] text-[var(--color-muted)]">
                    <p>{L(t.aiGen)} <strong className="block text-[22px] text-[var(--color-carbon)]">{ai.ai_generated}%</strong></p>
                    <p>{L(t.retouch)} <strong className="block text-[22px] text-[var(--color-carbon)]">{ai.retouched}%</strong></p>
                  </div>
                  <p className="mt-3 text-[15px] font-semibold">{ai.verdict}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-6">{ai.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
                </div>
              )}
            </div>
            <p className="mt-5 text-[12px] leading-5 text-[var(--color-muted)]">{L(t.note)}</p>
          </div>
        </article>
      )}
    </div>
  );
}
