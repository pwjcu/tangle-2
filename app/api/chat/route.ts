import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// API 라우트에서는 보안상 직접 클라이언트를 생성하는 게 안전합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ reply: "API 키가 없어요! 개발자에게 문의하세요." });
  }

  const openai = new OpenAI({ apiKey: apiKey });

  try {
    const { message } = await req.json();

    // 1. AI에게 줄 "컨닝 페이퍼" 만들기 (DB에서 시술 정보 싹 긁어오기)
    // 실제로는 데이터가 많으면 '벡터 검색(RAG)'을 써야 하지만, 지금은 다 가져와도 충분합니다.
    const { data: treatments } = await supabase
      .from('treatments')
      .select('name, price_min, price_max, description, side_effects, recovery, synergy');

    // 2. 정보를 문자열로 예쁘게 포장하기
    const knowledgeBase = treatments?.map(t => 
      `- ${t.name}: ${t.price_min}~${t.price_max}만원. 특징: ${t.description}. 부작용: ${t.side_effects}. 회복: ${t.recovery}. 꿀조합: ${t.synergy}`
    ).join('\n');

    // 3. 시스템 프롬프트(성격 부여 + 정보 주입) 강력하게 업그레이드
    const systemPrompt = `
      당신은 10년 차 피부과 상담 실장 '탱글이'입니다.
      아래 제공된 [병원 시술 데이터]를 기반으로 정확하게 상담해 주세요.
      
      [병원 시술 데이터]
      ${knowledgeBase}

      [상담 원칙]
      1. 위 데이터에 있는 시술과 가격 범위를 기준으로 추천하세요. 없는 시술은 지어내지 마세요.
      2. 사용자의 고민(가격, 통증, 회복기간)에 맞춰서 공감하며 답변하세요.
      3. 답변 끝에는 꼭 "더 궁금한 점이 있으신가요?"라고 친절하게 물어보세요.
      4. 답변은 3~4문장으로 간결하게 줄바꿈을 활용해 가독성 있게 작성하세요.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7, // 창의성 조절 (0.7 정도가 적당히 자연스러움)
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "죄송해요, 잠시 연결이 불안정하네요. 다시 말씀해 주시겠어요?" });
  }
}