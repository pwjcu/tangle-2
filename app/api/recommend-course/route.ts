import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.OPENAI_API_KEY;

type DowntimeLevel = "low" | "medium" | "high";

interface TreatmentRow {
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  description: string;
  synergy: string | null;
  side_effects: string | null;
  recovery: string | null;
  cycle: string | null;
  recommended_for: string | null;
}

const concernCategoryMap: Record<string, string[]> = {
  "탄력/리프팅": ["리프팅", "스킨부스터"],
  "주름/노화": ["리프팅", "보톡스", "스킨부스터"],
  "피부결/모공": ["관리", "모공흉터", "스킨부스터"],
  "잡티/색소": ["관리", "스킨부스터"],
  "여드름/흉터": ["모공흉터", "관리"],
};

function averagePrice(treatment: TreatmentRow) {
  return Math.round((treatment.price_min + treatment.price_max) / 2);
}

function scoreTreatment(
  treatment: TreatmentRow,
  concern: string,
  budget: number,
  goal: string,
  downtime: DowntimeLevel,
  age: string,
) {
  let score = 0;
  const reasons: string[] = [];
  const avgPrice = averagePrice(treatment);
  const preferredCategories = concernCategoryMap[concern] || [];
  const recovery = treatment.recovery || "";
  const description = `${treatment.description} ${treatment.recommended_for || ""}`.toLowerCase();

  if (preferredCategories.includes(treatment.category)) {
    score += 4;
    reasons.push(`${concern} 고민과 직접적으로 맞닿은 카테고리`);
  }

  if (avgPrice <= budget * 1.15) {
    score += 3;
    reasons.push("예산 범위 안에서 조합 가능");
  } else if (avgPrice <= budget * 1.35) {
    score += 1;
    reasons.push("예산을 약간 넘지만 후보로 검토 가능");
  }

  if (downtime === "low" && /(당일|즉시|다운타임 없음|거의 없음)/.test(recovery)) {
    score += 2;
    reasons.push("회복 부담이 비교적 적음");
  }

  if (downtime === "high" && !/(당일|즉시|다운타임 없음|거의 없음)/.test(recovery)) {
    score += 1;
    reasons.push("효과 우선형 선택으로 검토 가능");
  }

  if (goal === "가성비 중심" && avgPrice <= budget) {
    score += 1;
  }

  if (goal === "확실한 변화" && treatment.category === "리프팅") {
    score += 1;
  }

  if (goal === "시술 입문용" && /(진정|관리|입문|저자극|유지)/.test(description)) {
    score += 2;
    reasons.push("입문형 접근에 적합");
  }

  if ((age === "40대" || age === "50대 이상") && treatment.category === "리프팅") {
    score += 1;
  }

  if (concern === "여드름/흉터" && /(흉터|모공|트러블)/.test(description)) {
    score += 2;
  }

  return { treatment, score, reasons, avgPrice };
}

function choosePlan(scored: ReturnType<typeof scoreTreatment>[], budget: number) {
  const sorted = [...scored].sort((left, right) => right.score - left.score);
  const selected: ReturnType<typeof scoreTreatment>[] = [];
  let total = 0;

  for (const candidate of sorted) {
    if (selected.length >= 3) break;
    if (selected.some((entry) => entry.treatment.name === candidate.treatment.name)) continue;

    const nextTotal = total + candidate.avgPrice;
    if (nextTotal <= budget * 1.2 || selected.length === 0) {
      selected.push(candidate);
      total = nextTotal;
    }
  }

  if (selected.length === 0 && sorted[0]) {
    selected.push(sorted[0]);
    total = sorted[0].avgPrice;
  }

  return { selected, total };
}

function buildFallbackResult(
  selected: ReturnType<typeof scoreTreatment>[],
  totalPrice: number,
  concern: string,
  budget: number,
) {
  return {
    strategyTitle: `${concern} 중심 맞춤 조합`,
    summary:
      "데이터베이스에 있는 가격대와 회복 정보를 기준으로, 예산 안에서 체감 변화와 현실성을 함께 고려한 조합입니다.",
    budgetFit: `총 예상 금액은 약 ${totalPrice}만원으로, 입력한 예산 ${budget}만원을 기준으로 크게 벗어나지 않는 후보를 우선 선정했습니다.`,
    caution:
      "실제 피부 상태, 통증 민감도, 기존 시술 이력에 따라 최종 선택은 달라질 수 있습니다. 병원 상담에서 적합성과 불필요한 시술 여부를 꼭 다시 확인하세요.",
    confidenceNotes: [
      `${concern} 고민과 맞는 카테고리를 우선 선별했습니다.`,
      "예산 범위 안에서 조합 가능한 시술부터 검토했습니다.",
      "회복 부담이 큰 시술은 입력한 다운타임 허용도에 따라 뒤로 미뤘습니다.",
    ],
    requestCategory: selected[0]?.treatment.category || "기타",
    requestSummary: `${concern} 고민이 있어 ${selected
      .map((item) => item.treatment.name)
      .join(", ")} 조합을 우선 검토하고 싶습니다. 불필요한 시술은 제외하고 예산 안에서 상담받고 싶습니다.`,
    totalPrice,
    items: selected.map((item) => ({
      name: item.treatment.name,
      category: item.treatment.category,
      price: item.avgPrice,
      description: item.treatment.description,
      reason: item.reasons[0] || "고민과 예산 기준에 부합",
      recovery: item.treatment.recovery || "상담 시 확인 필요",
      sideEffects: item.treatment.side_effects || "상담 시 확인 필요",
      synergy: item.treatment.synergy || "단독 진행 가능",
    })),
  };
}

export async function POST(req: Request) {
  const { age, budget, concern, goal, downtime } = await req.json();
  const normalizedBudget = Number(budget);

  const { data: treatments } = await supabase
    .from("treatments")
    .select("name, category, price_min, price_max, description, synergy, side_effects, recovery, cycle, recommended_for");

  if (!treatments || treatments.length === 0) {
    return NextResponse.json({ error: "시술 데이터를 불러오지 못했습니다." }, { status: 500 });
  }

  const scored = (treatments as TreatmentRow[])
    .map((treatment) =>
      scoreTreatment(
        treatment,
        concern,
        normalizedBudget,
        goal,
        (downtime || "medium") as DowntimeLevel,
        age,
      ),
    )
    .filter((item) => item.score > 0);

  const { selected, total } = choosePlan(scored, normalizedBudget);
  const fallbackResult = buildFallbackResult(selected, total, concern, normalizedBudget);

  if (!apiKey) {
    return NextResponse.json(fallbackResult);
  }

  const openai = new OpenAI({ apiKey });
  const prompt = `
    너는 팩트 기반으로 시술 추천 결과를 정리하는 뷰티 상담 실장이다.
    아래의 선택 결과와 후보 시술 데이터만 사용해서 JSON으로만 답한다.
    데이터에 없는 가격, 효과, 회복 표현은 새로 만들지 않는다.

    [사용자 선택]
    - 나이: ${age}
    - 예산: ${normalizedBudget}만원
    - 핵심 고민: ${concern}
    - 원하는 결과: ${goal}
    - 다운타임 허용도: ${downtime}

    [선정된 후보]
    ${selected
      .map(
        (item) =>
          `- ${item.treatment.name} / ${item.treatment.category} / ${item.treatment.price_min}~${item.treatment.price_max}만원 / 설명: ${item.treatment.description} / 회복: ${item.treatment.recovery || "상담 시 확인 필요"} / 부작용: ${item.treatment.side_effects || "상담 시 확인 필요"} / 시너지: ${item.treatment.synergy || "단독 진행 가능"} / 선정 이유: ${item.reasons.join(", ")}`,
      )
      .join("\n")}

    [출력 JSON 형식]
    {
      "strategyTitle": "추천 전략 제목",
      "summary": "이 조합을 추천하는 이유를 2문장으로 설명",
      "budgetFit": "예산 관점 설명 1문장",
      "caution": "상담 전에 확인할 점 1문장",
      "requestCategory": "대표 카테고리 하나",
      "requestSummary": "견적 요청서에 넣을 수 있는 1~2문장",
      "confidenceNotes": ["근거1", "근거2", "근거3"],
      "items": [
        {
          "name": "시술명",
          "category": "카테고리",
          "price": 120,
          "description": "DB 설명을 바탕으로 한 짧은 설명",
          "reason": "왜 이 시술이 들어갔는지",
          "recovery": "회복 표현",
          "sideEffects": "부작용 표현",
          "synergy": "시너지 표현"
        }
      ]
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      ...fallbackResult,
      ...parsed,
      totalPrice: fallbackResult.totalPrice,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(fallbackResult);
  }
}
