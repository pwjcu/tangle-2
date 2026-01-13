import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) return NextResponse.json({ error: "API Key Error" });

  const openai = new OpenAI({ apiKey: apiKey });
  const { age, budget, concern } = await req.json(); // 프론트에서 받은 정보

  // 1. 시술 데이터 가져오기
  const { data: treatments } = await supabase
    .from('treatments')
    .select('name, price_min, price_max, category, description');

  const treatmentList = treatments?.map(t => `${t.name}(${t.category}, ${t.price_min}~${t.price_max}만)`).join(', ');

  // 2. AI에게 "코스 요리 짜줘" 라고 시키기 (JSON 포맷 강제)
  const systemPrompt = `
    너는 피부과 상담 실장이야.
    사용자의 나이(${age}), 예산(${budget}만원), 고민(${concern})에 맞춰서
    보유한 시술 목록([${treatmentList}]) 중 2~3가지를 조합하여 예산에 근접한 최적의 코스를 짜줘.
    
    반드시 아래 JSON 형식으로만 대답해. (설명 금지, 오직 JSON만)
    {
      "courseName": "창의적인 코스 이름 (예: 30대 동안 완성 풀패키지)",
      "totalPrice": "예상 총 가격 (숫자만, 예: 145)",
      "reason": "이 조합을 추천하는 이유 1줄 요약",
      "items": [
        { "name": "시술명1", "price": "예상가격", "desc": "짧은 효과 설명" },
        { "name": "시술명2", "price": "예상가격", "desc": "짧은 효과 설명" }
      ]
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      response_format: { type: "json_object" } // ★ 핵심: 무조건 JSON으로 뱉어라!
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI가 조합을 실패했어요." });
  }
}