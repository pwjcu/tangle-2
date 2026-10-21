import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { languageInstructions, supportedLanguages, type SupportedLanguage } from "../../../lib/i18n";
import { mergeLocalTreatments } from "../../../lib/localTreatments";
import { standardTreatmentPrices } from "../../../lib/시술표준가격";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.OPENAI_API_KEY;

function normalizeLanguage(value: unknown): SupportedLanguage {
  if (typeof value === "string" && supportedLanguages.includes(value as SupportedLanguage)) {
    return value as SupportedLanguage;
  }

  return "ko";
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({
      reply: "현재 AI 연결이 꺼져 있어요. 시술 가격대나 회복 정보는 관리자에게 먼저 확인해주세요.",
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { message, language } = await req.json();
    const responseLanguage = normalizeLanguage(language);

    const { data: treatments } = await supabase
      .from("treatments")
      .select("name, price_min, price_max, category, description, side_effects, recovery, synergy, cycle, recommended_for");

    const mergedTreatments = mergeLocalTreatments(treatments);

    const treatmentInfo = mergedTreatments
      ?.map((treatment) =>
        [
          `- 시술명: ${treatment.name}`,
          `카테고리: ${treatment.category}`,
          `가격대: ${treatment.price_min}~${treatment.price_max}만원`,
          `설명: ${treatment.description}`,
          `부작용: ${treatment.side_effects || "별도 기재 없음"}`,
          `회복: ${treatment.recovery || "별도 기재 없음"}`,
          `추천 대상: ${treatment.recommended_for || "별도 기재 없음"}`,
          `시너지: ${treatment.synergy || "별도 기재 없음"}`,
          `권장 주기: ${treatment.cycle || "별도 기재 없음"}`,
        ].join(" / "),
      )
      .join("\n");

    const standardPriceInfo = standardTreatmentPrices
      .map((price) =>
        [
          `- 시술명: ${price.treatment_name}`,
          `별칭: ${price.aliases.join(", ") || "별도 기재 없음"}`,
          `규격: ${price.variant}`,
          `가격대: ${price.min_price_manwon}~${price.max_price_manwon}만원`,
          `제공 평균: ${price.average_price_manwon === null ? "미제공" : `${price.average_price_manwon}만원`}`,
          `가격 유형(kind): ${price.kind}`,
          `회차: ${price.session_count === null ? "환산 불가 또는 미제공" : `${price.session_count}회`}`,
        ].join(" / "),
      )
      .join("\n");

    const systemPrompt = `
      너는 가격과 회복 정보까지 같이 설명하는 뷰티 상담 가이드다.
      아래 시술 데이터와 표준규격 가격 자료만 근거로 답변해야 하며, 없는 정보는 추측하지 않는다.

      [시술 데이터]
      ${treatmentInfo}

      [표준규격 가격 자료 — 2026-10-21 반영]
      사용자가 제공한 요약자료이며 가격은 만원 단위, 부가세(VAT) 10% 별도 기준이다.
      원본 가격표 이미지 75건을 독립적으로 검증한 자료가 아니며, 실시간 시세나 검증된 실측 통계로 표현하지 않는다.
      제공 평균은 사용자 자료에 적힌 값이며 새로 계산한 통계가 아니다. 미제공된 평균을 임의로 계산하지 않는다.
      kind는 single=단일 시술, package=패키지, combination=복합 시술, unlimited=무제한권을 뜻한다.
      ${standardPriceInfo}

      [답변 원칙]
      1. 가격 질문에서 같은 시술과 규격이 표준규격 가격 자료에 있으면 그 가격대를 우선 사용하고 시술명, 용량·샷수·회차 등의 규격과 부가세 별도 기준을 함께 말한다. 규격이 불명확하면 용량이나 샷수 등 비교에 필요한 조건을 먼저 질문한다.
      2. 부작용이나 회복 질문이면 데이터에 있는 표현만 요약한다.
      3. 진단처럼 단정하지 말고, 최종 판단은 실제 병원 상담이 필요하다고 안내한다.
      4. 답변은 3~5문장으로 간결하게 작성한다.
      5. 시술 비교를 요청받으면 가격, 회복, 시너지 기준으로 정리한다.
      6. 반드시 ${languageInstructions[responseLanguage]}로 답변한다.
      7. 단일 시술, 패키지, 복합 시술, 무제한권의 가격을 섞거나 규격이 다른 가격을 하나의 범위로 합치지 않는다. 무제한권을 임의로 1회 가격으로 환산하지 않는다.
      8. 표준규격 가격 자료에 없는 시술의 가격은 기존 시술 데이터에 있는 범위만 말하며, 해당 규격의 가격 근거가 없으면 확인이 필요하다고 안내한다.
      9. 자료의 행 수나 이미지 75건을 시술별 근거 표본 수로 말하지 않으며, 제공 평균·범위에 통계적 검증이 끝났다고 표현하지 않는다.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      reply: "답변을 정리하는 중 문제가 생겼어요. 잠시 후 다시 질문해주세요.",
    });
  }
}
