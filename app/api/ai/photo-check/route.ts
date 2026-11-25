import { NextResponse } from "next/server";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody } from "../../../../lib/상담입력검증";
import { aiRateLimited, askAIJson, languageNames } from "../../../../lib/탱글AI";

import { isCrossSite } from "../../../../lib/요청출처";
type PhotoAI = { ai_generated: number; retouched: number; verdict: string; signals: string[] };

const clamp = (value: unknown) => Math.round(Math.max(0, Math.min(100, Number(value) || 0)));

/** 사용자가 동의한 경우에만, 브라우저에서 줄인 사진 한 장을 AI가 한 번 더 봅니다. 저장하지 않습니다. */
export async function POST(req: Request) {
  if (isCrossSite(req)) return NextResponse.json({ error: "요청 출처를 확인할 수 없습니다." }, { status: 403 });
  try {
    const body = await readConsultBody(req, 600_000);
    const language = normalizeConsultLanguage(body.language);
    if (body.consent !== true) return NextResponse.json({ error: "사진을 AI로 보내는 데 동의해 주세요." }, { status: 400 });
    const image = typeof body.image === "string" ? body.image : "";
    if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 560_000) {
      return NextResponse.json({ error: "사진 형식을 확인해 주세요." }, { status: 400 });
    }
    if (aiRateLimited(req, 6)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    const ai = await askAIJson<PhotoAI>({
      system: `You check photos attached to clinic/treatment reviews on tangle.kr for signs of deception.
Estimate (0-100) how likely the photo is AI-generated, and how likely it was heavily retouched (face slimming, skin smoothing, warped background lines near the face, liquify, beauty filters, inconsistent lighting or shadows, repeated textures, malformed hands/teeth/ears/jewelry, text artifacts).
These are estimates, never proof. Do not identify the person or comment on their appearance or attractiveness.
Write in ${languageNames[language]}. Return JSON: {"ai_generated": number, "retouched": number, "verdict": string (one short sentence), "signals": string[] (2-5 short, concrete observations)}.`,
      user: "Check this review photo.",
      imageDataUrl: image,
      maxTokens: 500,
    });
    if (!ai || !Array.isArray(ai.signals)) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
    return NextResponse.json({
      result: { ai_generated: clamp(ai.ai_generated), retouched: clamp(ai.retouched), verdict: String(ai.verdict ?? ""), signals: ai.signals.slice(0, 5).map(String) },
      source: "ai",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ error: known ? error.message : "잠시 후 다시 시도해 주세요." }, { status: known ? error.status : 500 });
  }
}
