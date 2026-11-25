import { NextResponse } from "next/server";
import { localQuestionSheet, type QuestionSheet } from "../../../../lib/AI도구";
import { getStandardPricesForTreatment } from "../../../../lib/시술표준가격";
import { loadConsultTreatments } from "../../../../lib/상담시술자료";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody, readConsultText } from "../../../../lib/상담입력검증";
import { formatClinicRecommendationContext } from "../../../../lib/서울경험추천";
import { aiRateLimited, askAIJson, languageNames, TANGLE_AI_RULES } from "../../../../lib/탱글AI";

import { isCrossSite } from "../../../../lib/요청출처";
function isSheet(value: unknown): value is QuestionSheet {
  const sheet = value as QuestionSheet;
  return Boolean(sheet && typeof sheet.title === "string" && Array.isArray(sheet.sections)
    && sheet.sections.every((section) => typeof section.heading === "string" && Array.isArray(section.items) && section.items.every((item) => typeof item === "string")));
}

export async function POST(req: Request) {
  if (isCrossSite(req)) return NextResponse.json({ error: "요청 출처를 확인할 수 없습니다." }, { status: 403 });
  try {
    const body = await readConsultBody(req, 8_192);
    const language = normalizeConsultLanguage(body.language);
    const treatment = readConsultText(body.treatment, "시술·수술 이름", 80);
    const concern = typeof body.concern === "string" ? body.concern.trim().slice(0, 600) : "";
    const treatments = await loadConsultTreatments();
    const data = treatments.find((item) => treatment.includes(item.name) || item.name.includes(treatment));
    const fallback = localQuestionSheet(treatment, language, data);
    if (aiRateLimited(req)) return NextResponse.json({ sheet: fallback, source: "reference" });

    const prices = getStandardPricesForTreatment(data?.name ?? treatment).slice(0, 6)
      .map((price) => `${price.variant}: ${price.min_price_manwon}~${price.max_price_manwon}만원(VAT 별도)`).join("\n");
    const sheet = await askAIJson<QuestionSheet>({
      system: `${TANGLE_AI_RULES}
Create a personalized consultation question sheet the user can bring to a clinic in Korea. Write it in ${languageNames[language]}.
Return JSON: {"title": string, "sections": [{"heading": string, "items": string[]}]}.
Use 4-5 sections: questions for the doctor, cost/quote checks, recovery and side effects, things specific to the user's concern, and red flags. 3-5 short, concrete items each.
If Tangle reference prices exist, include one item comparing the quote with that range. Do not recommend a specific clinic.`,
      user: `Treatment: ${treatment}\nUser's concern: ${concern || "(none)"}\n\n[Tangle treatment data]\n${data ? `${data.name}: ${data.description} / 회복: ${data.recovery || "미기재"} / 주의: ${data.side_effects || "미기재"} / 주기: ${data.cycle || "미기재"}` : "(no record)"}\n\n[Tangle reference prices]\n${prices || "(none)"}\n\n${formatClinicRecommendationContext(treatment).slice(0, 3_000)}`,
      maxTokens: 1_200,
    });
    return NextResponse.json(isSheet(sheet) ? { sheet, source: "ai" } : { sheet: fallback, source: "reference" });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ error: known ? error.message : "잠시 후 다시 시도해주세요." }, { status: known ? error.status : 500 });
  }
}
