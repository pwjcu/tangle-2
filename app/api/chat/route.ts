import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({
      reply: "현재 AI 연결이 꺼져 있어요. 시술 가격대나 회복 정보는 관리자에게 먼저 확인해주세요.",
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { message } = await req.json();

    const { data: treatments } = await supabase
      .from("treatments")
      .select("name, price_min, price_max, category, description, side_effects, recovery, synergy, cycle, recommended_for");

    const treatmentInfo = treatments
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

    const systemPrompt = `
      너는 가격과 회복 정보까지 같이 설명하는 뷰티 상담 가이드다.
      아래 시술 데이터만 근거로 답변해야 하며, 없는 정보는 추측하지 않는다.

      [시술 데이터]
      ${treatmentInfo}

      [답변 원칙]
      1. 가격 질문이면 데이터에 있는 범위만 말한다.
      2. 부작용이나 회복 질문이면 데이터에 있는 표현만 요약한다.
      3. 진단처럼 단정하지 말고, 최종 판단은 실제 병원 상담이 필요하다고 안내한다.
      4. 답변은 3~5문장으로 간결하게 작성한다.
      5. 시술 비교를 요청받으면 가격, 회복, 시너지 기준으로 정리한다.
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
