import { NextResponse } from "next/server";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody, readConsultChoice, readConsultText } from "../../../../lib/상담입력검증";
import { aiRateLimited, askAIJson, languageNames } from "../../../../lib/탱글AI";

import { isCrossSite } from "../../../../lib/요청출처";
type Translation = { translated: string; check: string };

export async function POST(req: Request) {
  if (isCrossSite(req)) return NextResponse.json({ error: "요청 출처를 확인할 수 없습니다." }, { status: 403 });
  try {
    const body = await readConsultBody(req, 8_192);
    const language = normalizeConsultLanguage(body.language);
    const direction = readConsultChoice(body.direction, ["toKorean", "fromKorean"], "번역 방향");
    const text = readConsultText(body.text, "문장", 600);
    if (aiRateLimited(req, 20)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

    const toKorean = direction === "toKorean";
    const target = toKorean ? "Korean" : languageNames[language];
    const ai = await askAIJson<Translation>({
      system: `You are Tangle AI's medical-visit interpreter for international patients at Korean clinics.
Translate the text into ${target}. Keep medical terms accurate and the tone polite (Korean: 존댓말, suitable to show clinic staff).
Do not add advice or content that is not in the original.
Return JSON: {"translated": string, "check": string}. "check" is a short back-translation of your result into ${toKorean ? languageNames[language] : "Korean"} so the reader can confirm the meaning.`,
      user: text,
      maxTokens: 500,
    });
    if (!ai || typeof ai.translated !== "string") {
      return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ translated: ai.translated, check: typeof ai.check === "string" ? ai.check : "", source: "ai" });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ error: known ? error.message : "잠시 후 다시 시도해주세요." }, { status: known ? error.status : 500 });
  }
}
