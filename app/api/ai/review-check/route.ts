import { NextResponse } from "next/server";
import { localReviewCheck, type ReviewCheck } from "../../../../lib/AI도구";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody, readConsultText } from "../../../../lib/상담입력검증";
import { aiRateLimited, askAIJson, languageNames } from "../../../../lib/탱글AI";

export async function POST(req: Request) {
  try {
    const body = await readConsultBody(req, 16_384);
    const language = normalizeConsultLanguage(body.language);
    const text = readConsultText(body.text, "후기", 3_000);
    const local = localReviewCheck(text);
    if (aiRateLimited(req)) return NextResponse.json({ result: local, source: "reference" });

    const ai = await askAIJson<ReviewCheck>({
      system: `You are Tangle AI's review checker. Tangle (tangle.kr) is an ad-free clinic information hub in Korea that filters out sponsored ("체험단", "협찬", "원고료") and promotional reviews.
Judge how likely the given clinic/treatment review is sponsored, paid, or promotional rather than a genuine personal experience.
Look for: disclosure phrases, booking/event links, exaggerated claims ("100%", "no pain at all", "인생병원"), coordinator/doctor name-dropping, no downsides, template-like structure, versus genuine signals (specific dates, prices, discomfort, mixed feelings).
Write in ${languageNames[language]}. Return JSON: {"score": number 0-100 (higher = more likely an ad), "verdict": string (one short sentence), "signals": string[] (3-6 short evidence points quoting the review briefly), "tips": string[] (2-3 short tips on what to verify)}.
This is an estimate, not proof. Never claim certainty.`,
      user: `[Review]\n${text}\n\n[Rule-based signals from Tangle]\nscore ${local.score}: ${local.signals.join(" / ")}`,
      maxTokens: 700,
    });
    const valid = ai && typeof ai.score === "number" && typeof ai.verdict === "string" && Array.isArray(ai.signals) && Array.isArray(ai.tips);
    if (!valid) return NextResponse.json({ result: local, source: "reference" });
    return NextResponse.json({
      result: { score: Math.round(Math.max(0, Math.min(100, ai.score))), verdict: ai.verdict, signals: ai.signals.slice(0, 6).map(String), tips: ai.tips.slice(0, 3).map(String) },
      source: "ai",
    });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ error: known ? error.message : "잠시 후 다시 시도해주세요." }, { status: known ? error.status : 500 });
  }
}
