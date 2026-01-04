import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

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

    // 1. 시술 정보 가져오기
    const { data: treatments } = await supabase
      .from('treatments')
      .select('name, price_min, price_max, description, side_effects, recovery, synergy');

    // 2. 블로그 정보 가져오기
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('title, summary, content, original_url');

    // 3. 지식 뭉치기
    const treatmentInfo = treatments?.map(t => 
      `- [시술] ${t.name}: ${t.price_min}~${t.price_max}만원. 특징: ${t.description}. 부작용: ${t.side_effects}. 회복: ${t.recovery}. 꿀조합: ${t.synergy}`
    ).join('\n') || "";

    const blogInfo = blogPosts?.map(b => 
      `- [꿀팁/블로그] 제목: ${b.title}, 요약: ${b.summary}, 링크: ${b.original_url || "https://blog.naver.com/manner_maketh_beauty"} (내용: ${b.content?.substring(0, 200)}...)` 
    ).join('\n') || "";

    const knowledgeBase = `
      [병원 시술 데이터]
      ${treatmentInfo}

      [원장님 블로그 칼럼 & 꿀팁]
      ${blogInfo}
    `;

    // 4. 시스템 프롬프트 (★ 블로그 주소 직접 입력 완료)
    const systemPrompt = `
      당신은 10년 차 피부과 상담 실장 '탱글이'입니다.
      아래 제공된 [지식 베이스]를 바탕으로 전문적이고 친절하게 상담해 주세요.
      
      [기본 정보]
      - 블로그 메인 주소: https://blog.naver.com/manner_maketh_beauty
      
      [지식 베이스]
      ${knowledgeBase}

      [상담 원칙]
      1. 질문과 관련된 '시술'이나 '블로그 꿀팁'이 있다면 적극적으로 인용해서 설명하세요.
      2. 블로그 내용을 언급할 때는 "자세한 내용은 제 블로그를 참고하세요: [링크]" 형태로 안내하세요.
      3. 만약 특정 글의 링크가 없다면, 위의 '블로그 메인 주소'를 대신 알려주세요.
      4. 가격 질문에는 DB에 있는 정확한 가격 범위를 안내하세요.
      5. 답변은 3~4문장으로 핵심만 간결하게 줄바꿈하여 작성하세요.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "죄송해요, 잠시 연결이 불안정하네요. 다시 말씀해 주시겠어요?" });
  }
}