"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SupportedLanguage } from "../../lib/i18n";
import { commonUi, formatPrice, localizeCategoryName } from "../../lib/localizedUi";
import { useLanguage } from "../components/LanguageProvider";

type QuestionKey = "concern" | "budget" | "age" | "goal" | "downtime";

interface Option {
  label: string;
  value: string;
  hint: string;
}

interface Question {
  key: QuestionKey;
  title: string;
  subtitle: string;
  shortLabel: string;
  options: Option[];
}

interface RecommendationItem {
  name: string;
  category: string;
  price: number;
  description: string;
  reason: string;
  recovery: string;
  sideEffects: string;
  synergy: string;
}

interface RecommendationResult {
  strategyTitle: string;
  summary: string;
  budgetFit: string;
  caution: string;
  totalPrice: number;
  totalPriceRange?: { min: number; max: number };
  requestCategory: string;
  requestSummary: string;
  confidenceNotes: string[];
  items: RecommendationItem[];
}

const questions: Question[] = [
  {
    key: "concern",
    shortLabel: "concern",
    title: "지금 가장 먼저 해결하고 싶은 고민은 무엇인가요?",
    subtitle: "모든 고민을 한 번에 풀기보다, 병원 제안의 기준이 될 핵심 고민 하나를 먼저 정합니다.",
    options: [
      { label: "탄력/리프팅", value: "탄력/리프팅", hint: "처짐, 턱선, 얼굴 탄력 저하" },
      { label: "주름/노화", value: "주름/노화", hint: "잔주름, 표정주름, 노화 인상" },
      { label: "피부결·모공", value: "피부결·모공", hint: "거친 결, 모공, 푸석함" },
      { label: "톤업/색소", value: "톤업/색소", hint: "기미, 잡티, 색소, 칙칙함" },
      { label: "여드름·흉터", value: "여드름·흉터", hint: "흉터, 붉은 자국, 반복 여드름" },
      { label: "회복/항노화", value: "회복/항노화", hint: "컨디션, 회복 보조, 항노화 관리" },
      { label: "바디라인", value: "바디라인", hint: "이중턱, 복부, 팔, 허벅지 라인" },
    ],
  },
  {
    key: "budget",
    shortLabel: "budget",
    title: "이번에 생각하는 예산은 어느 정도인가요?",
    subtitle: "등록 가격 범위 상한의 합계가 예산 이내인 후보를 찾습니다. 규격·세금·추가 비용은 상담에서 확인해 주세요.",
    options: [
      { label: "50만원 이하", value: "50", hint: "입문 시술이나 단일 관리 중심" },
      { label: "80만원 이내", value: "80", hint: "예산 상한 80만원" },
      { label: "120만원 이내", value: "120", hint: "예산 상한 120만원" },
      { label: "180만원 이내", value: "180", hint: "예산 상한 180만원" },
      { label: "250만원 이내", value: "250", hint: "예산 상한 250만원" },
    ],
  },
  {
    key: "age",
    shortLabel: "age",
    title: "현재 나이대는 어디에 가까운가요?",
    subtitle: "나이는 정답이 아니라 추천 강도를 조절하는 참고값으로 사용합니다.",
    options: [
      { label: "20대", value: "20대", hint: "예방과 가벼운 개선 중심" },
      { label: "30대", value: "30대", hint: "자연스러운 개선과 유지 관리" },
      { label: "40대", value: "40대", hint: "처짐과 탄력 변화를 함께 고려" },
      { label: "50대 이상", value: "50대 이상", hint: "체감 변화와 회복 조건을 함께 검토" },
    ],
  },
  {
    key: "goal",
    shortLabel: "goal",
    title: "이번 선택에서 가장 원하는 결과는 무엇인가요?",
    subtitle: "같은 예산이어도 결과 강도에 따라 추천 조합이 달라집니다.",
    options: [
      { label: "자연스럽게 정리", value: "자연스럽게 정리", hint: "티 나지 않는 변화" },
      { label: "확실한 변화", value: "확실한 변화", hint: "눈에 보이는 체감 변화" },
      { label: "가성비 중심", value: "가성비 중심", hint: "총액 효율과 유지 비용 우선" },
      { label: "시술 입문", value: "시술 입문", hint: "부담이 낮은 첫 경험" },
    ],
  },
  {
    key: "downtime",
    shortLabel: "recovery",
    title: "다운타임은 어느 정도까지 괜찮나요?",
    subtitle: "회복 부담을 줄일지, 효과 체감을 우선할지 정하는 중요한 기준입니다.",
    options: [
      { label: "거의 없었으면 좋겠어요", value: "low", hint: "당일 일상 복귀가 중요" },
      { label: "며칠 정도는 괜찮아요", value: "medium", hint: "가벼운 붓기와 멍은 허용" },
      { label: "효과가 좋다면 감수 가능", value: "high", hint: "회복보다 결과를 우선" },
    ],
  },
];

const recommendCopy: Record<
  SupportedLanguage,
  {
    eyebrow: string;
    title: string[];
    intro: string;
    previous: string;
    autoResult: string;
    loadingTitle: string[];
    resultEyebrow: string;
    estimatedTotal: string;
    requestCta: string;
    resultLabels: { reason: string; recovery: string; caution: string };
    alerts: { fail: string };
    questions: Partial<Record<QuestionKey, { title: string; subtitle: string; options: Record<string, { label: string; hint: string }> }>>;
  }
> = {
  ko: {
    eyebrow: "조건별 시술 탐색",
    title: ["내 기준에 맞는", "시술 후보 찾기"],
    intro: "긴 상담 전에 필요한 기준만 묻습니다. 고민, 예산, 나이대, 원하는 변화, 다운타임을 기준으로 추천 후보를 정리합니다.",
    previous: "이전",
    autoResult: "마지막 질문 뒤 결과가 자동 생성됩니다",
    loadingTitle: ["예산과 고민에 맞는 후보를 정리하고 있어요.", "잠시만 기다려주세요"],
    resultEyebrow: "추천 결과",
    estimatedTotal: "예상 총액",
    requestCta: "견적 요청으로 이동",
    resultLabels: { reason: "추천 이유", recovery: "회복", caution: "주의" },
    alerts: { fail: "추천 결과를 가져오지 못했어요. 잠시 후 다시 시도해주세요." },
    questions: {},
  },
  en: {
    eyebrow: "Treatment candidates",
    title: ["Treatment candidates", "from a short survey"],
    intro: "Answer only the key questions before a long consultation. Tangle narrows candidates by concern, budget, age range, goal, and downtime.",
    previous: "Previous",
    autoResult: "Results are generated automatically after the last question.",
    loadingTitle: ["I will recommend the best-fit combination", "for your budget and concern. Please wait."],
    resultEyebrow: "recommendation result",
    estimatedTotal: "estimated total",
    requestCta: "Go to quote request",
    resultLabels: { reason: "Reason", recovery: "Recovery", caution: "Caution" },
    alerts: { fail: "I could not load the recommendation. Please try again shortly." },
    questions: {
      concern: {
        title: "What concern do you want to solve first?",
        subtitle: "Choose one core concern first so clinics can make a clearer proposal.",
        options: {
          "탄력/리프팅": { label: "Elasticity/lifting", hint: "Sagging, jawline, lower facial firmness" },
          "주름/노화": { label: "Wrinkles/aging", hint: "Fine lines, expression lines, aged impression" },
          "피부결·모공": { label: "Texture/pores", hint: "Rough texture, pores, dull skin condition" },
          "톤업/색소": { label: "Tone/pigment", hint: "Melasma, spots, pigmentation, dull tone" },
          "여드름·흉터": { label: "Acne/scars", hint: "Scars, redness marks, recurring acne" },
          "회복/항노화": { label: "Recovery/anti-aging", hint: "Condition, recovery support, anti-aging care" },
          바디라인: { label: "Body contour", hint: "Double chin, abdomen, arms, thigh line" },
        },
      },
      budget: {
        title: "What budget are you considering?",
        subtitle: "We prioritize candidates that fit your total budget and push excessive combinations lower.",
        options: {
          "50": { label: "Under ₩500,000", hint: "Starter treatments or single-care options" },
          "80": { label: "Around ₩800,000", hint: "Light combinations can be considered" },
          "120": { label: "Around ₩1,200,000", hint: "Balance between visible change and stability" },
          "180": { label: "Around ₩1,800,000", hint: "Mid-to-high combinations can be explored" },
          "250": { label: "₩2,500,000+", hint: "Premium lifting and package candidates included" },
        },
      },
      age: {
        title: "Which age range is closest?",
        subtitle: "Age is only a reference for adjusting recommendation intensity.",
        options: {
          "20대": { label: "20s", hint: "Prevention and light improvement" },
          "30대": { label: "30s", hint: "Natural improvement and maintenance" },
          "40대": { label: "40s", hint: "Sagging and elasticity changes together" },
          "50대 이상": { label: "50s+", hint: "Visible change and recovery conditions together" },
        },
      },
      goal: {
        title: "What result do you want most?",
        subtitle: "Even with the same budget, the recommendation changes by desired intensity.",
        options: {
          "자연스럽게 정리": { label: "Natural refinement", hint: "Subtle change" },
          "확실한 변화": { label: "Clear change", hint: "Noticeable visible result" },
          "가성비 중심": { label: "Value focused", hint: "Total efficiency and maintenance cost first" },
          "시술 입문": { label: "First treatment", hint: "Low-burden first experience" },
        },
      },
      downtime: {
        title: "How much downtime is acceptable?",
        subtitle: "This decides whether to reduce recovery burden or prioritize effect.",
        options: {
          low: { label: "Almost none", hint: "Same-day daily life matters" },
          medium: { label: "A few days are okay", hint: "Light swelling or bruising is acceptable" },
          high: { label: "Acceptable for better effect", hint: "Prioritize result over recovery" },
        },
      },
    },
  },
  zh: {
    eyebrow: "条件筛选",
    title: ["基于问卷的", "项目候选"],
    intro: "在长时间咨询前，只询问必要标准。根据烦恼、预算、年龄段、目标和恢复期整理候选项目。",
    previous: "上一步",
    autoResult: "最后一个问题后会自动生成结果",
    loadingTitle: ["正在根据预算和烦恼", "为你推荐最合适的组合，请稍等"],
    resultEyebrow: "推荐结果",
    estimatedTotal: "预计总价",
    requestCta: "前往申请报价",
    resultLabels: { reason: "推荐理由", recovery: "恢复", caution: "注意" },
    alerts: { fail: "暂时无法获取推荐结果，请稍后再试。" },
    questions: {
      concern: {
        title: "你最想优先解决的烦恼是什么？",
        subtitle: "先选择一个核心烦恼，医院才能给出更清晰的提案。",
        options: {
          "탄력/리프팅": { label: "弹力/提升", hint: "下垂、下颌线、脸部弹性下降" },
          "주름/노화": { label: "皱纹/老化", hint: "细纹、表情纹、老化印象" },
          "피부결·모공": { label: "肤质/毛孔", hint: "粗糙肤质、毛孔、干枯感" },
          "톤업/색소": { label: "提亮/色素", hint: "斑点、色沉、暗沉肤色" },
          "여드름·흉터": { label: "痘痘/痘疤", hint: "痘疤、泛红痕迹、反复痘痘" },
          "회복/항노화": { label: "恢复/抗老", hint: "状态、恢复辅助、抗老管理" },
          바디라인: { label: "身体线条", hint: "双下巴、腹部、手臂、大腿线条" },
        },
      },
      budget: {
        title: "这次考虑的预算是多少？",
        subtitle: "先优先整理总额内可行的候选，预算外组合会后置。",
        options: {
          "50": { label: "50万韩元以下", hint: "入门项目或单项护理为主" },
          "80": { label: "80万韩元左右", hint: "可考虑轻组合" },
          "120": { label: "120万韩元左右", hint: "体感变化与稳定性的平衡" },
          "180": { label: "180万韩元左右", hint: "可探索中高阶组合" },
          "250": { label: "250万韩元以上", hint: "包含高价提升和套餐候选" },
        },
      },
      age: {
        title: "你的年龄段更接近哪一项？",
        subtitle: "年龄不是答案，只用于调整推荐强度。",
        options: {
          "20대": { label: "20多岁", hint: "预防和轻度改善为主" },
          "30대": { label: "30多岁", hint: "自然改善和维持管理" },
          "40대": { label: "40多岁", hint: "同时考虑下垂和弹力变化" },
          "50대 이상": { label: "50岁以上", hint: "体感变化和恢复条件一起考虑" },
        },
      },
      goal: {
        title: "这次最想要的结果是什么？",
        subtitle: "同样预算下，结果强度不同，推荐组合也会不同。",
        options: {
          "자연스럽게 정리": { label: "自然整理", hint: "不夸张的变化" },
          "확실한 변화": { label: "明确变化", hint: "肉眼可见的体感变化" },
          "가성비 중심": { label: "性价比优先", hint: "总额效率和维持费用优先" },
          "시술 입문": { label: "项目入门", hint: "负担较低的首次体验" },
        },
      },
      downtime: {
        title: "可接受的恢复期是多久？",
        subtitle: "这是决定减少恢复负担还是优先效果的重要标准。",
        options: {
          low: { label: "几乎没有最好", hint: "当天恢复日常很重要" },
          medium: { label: "几天可以接受", hint: "轻微浮肿和淤青可接受" },
          high: { label: "效果好可接受", hint: "效果优先于恢复" },
        },
      },
    },
  },
  ja: {
    eyebrow: "条件で絞り込み",
    title: ["アンケートに基づく", "施術候補"],
    intro: "長い相談の前に必要な基準だけを確認します。悩み、予算、年齢層、希望する変化、ダウンタイムで候補を整理します。",
    previous: "前へ",
    autoResult: "最後の質問後に結果が自動生成されます",
    loadingTitle: ["予算と悩みに合う最適な組み合わせを", "おすすめします。少しお待ちください"],
    resultEyebrow: "推薦結果",
    estimatedTotal: "推定合計",
    requestCta: "見積依頼へ",
    resultLabels: { reason: "推薦理由", recovery: "回復", caution: "注意" },
    alerts: { fail: "推薦結果を取得できませんでした。少し後でもう一度お試しください。" },
    questions: {
      concern: {
        title: "最初に解決したい悩みは何ですか？",
        subtitle: "すべてを一度に解決するより、提案の基準となる悩みを一つ選びます。",
        options: {
          "탄력/리프팅": { label: "弾力/リフト", hint: "たるみ、フェイスライン、弾力低下" },
          "주름/노화": { label: "しわ/老化", hint: "小じわ、表情じわ、老けた印象" },
          "피부결·모공": { label: "肌質/毛穴", hint: "ざらつき、毛穴、乾燥感" },
          "톤업/색소": { label: "トーン/色素", hint: "シミ、色素、くすみ" },
          "여드름·흉터": { label: "ニキビ/跡", hint: "傷跡、赤み跡、繰り返すニキビ" },
          "회복/항노화": { label: "回復/抗老化", hint: "コンディション、回復補助、抗老化ケア" },
          바디라인: { label: "ボディライン", hint: "二重あご、腹部、腕、太ももライン" },
        },
      },
      budget: {
        title: "今回考えている予算はどのくらいですか？",
        subtitle: "総額基準で無理のない候補を優先し、予算外の組み合わせは後回しにします。",
        options: {
          "50": { label: "50万ウォン以下", hint: "入門施術や単独ケア中心" },
          "80": { label: "80万ウォン台", hint: "軽い組み合わせも検討可能" },
          "120": { label: "120万ウォン台", hint: "体感変化と安定性のバランス" },
          "180": { label: "180万ウォン台", hint: "中上級の組み合わせまで探索" },
          "250": { label: "250万ウォン以上", hint: "高価格リフトやパッケージ候補を含む" },
        },
      },
      age: {
        title: "現在の年齢層はどれに近いですか？",
        subtitle: "年齢は正解ではなく、推薦強度を調整する参考値です。",
        options: {
          "20대": { label: "20代", hint: "予防と軽い改善中心" },
          "30대": { label: "30代", hint: "自然な改善と維持管理" },
          "40대": { label: "40代", hint: "たるみと弾力変化を一緒に考慮" },
          "50대 이상": { label: "50代以上", hint: "体感変化と回復条件を一緒に検討" },
        },
      },
      goal: {
        title: "今回もっとも望む結果は何ですか？",
        subtitle: "同じ予算でも、結果の強度によって推薦が変わります。",
        options: {
          "자연스럽게 정리": { label: "自然に整える", hint: "目立ちすぎない変化" },
          "확실한 변화": { label: "はっきりした変化", hint: "見てわかる体感変化" },
          "가성비 중심": { label: "コスパ重視", hint: "総額効率と維持費を優先" },
          "시술 입문": { label: "施術入門", hint: "負担の少ない初体験" },
        },
      },
      downtime: {
        title: "ダウンタイムはどの程度まで大丈夫ですか？",
        subtitle: "回復負担を減らすか、効果を優先するかを決める基準です。",
        options: {
          low: { label: "ほぼない方がよい", hint: "当日の日常復帰が重要" },
          medium: { label: "数日なら大丈夫", hint: "軽い腫れやあざは許容" },
          high: { label: "効果が良ければ許容", hint: "回復より結果を優先" },
        },
      },
    },
  },
  th: {
    eyebrow: "ค้นหาหัตถการ",
    title: ["ตัวเลือกหัตถการ", "จากแบบสอบถามสั้นๆ"],
    intro: "ถามเฉพาะเกณฑ์สำคัญก่อนปรึกษายาว ระบบจะจัดตัวเลือกตามปัญหา งบประมาณ ช่วงอายุ เป้าหมาย และเวลาพักฟื้น",
    previous: "ก่อนหน้า",
    autoResult: "ระบบจะสร้างผลลัพธ์อัตโนมัติหลังคำถามสุดท้าย",
    loadingTitle: ["กำลังแนะนำชุดหัตถการที่เหมาะที่สุด", "กับงบและปัญหาของคุณ โปรดรอสักครู่"],
    resultEyebrow: "ผลการแนะนำ",
    estimatedTotal: "ราคารวมโดยประมาณ",
    requestCta: "ไปที่คำขอราคา",
    resultLabels: { reason: "เหตุผล", recovery: "พักฟื้น", caution: "ข้อควรระวัง" },
    alerts: { fail: "ไม่สามารถโหลดผลแนะนำได้ โปรดลองอีกครั้งภายหลัง" },
    questions: {
      concern: {
        title: "ปัญหาที่อยากแก้ก่อนคืออะไร?",
        subtitle: "เลือกปัญหาหลักหนึ่งอย่างก่อน เพื่อให้คลินิกเสนอแผนได้ชัดขึ้น",
        options: {
          "탄력/리프팅": { label: "ความยืดหยุ่น/ยกกระชับ", hint: "หย่อนคล้อย กรอบหน้า ความแน่นของผิว" },
          "주름/노화": { label: "ริ้วรอย/วัย", hint: "ริ้วเล็ก รอยแสดงสีหน้า ภาพลักษณ์ดูมีอายุ" },
          "피부결·모공": { label: "ผิวสัมผัส/รูขุมขน", hint: "ผิวหยาบ รูขุมขน ผิวไม่สดใส" },
          "톤업/색소": { label: "โทนผิว/เม็ดสี", hint: "ฝ้า จุดด่างดำ สีผิวหมอง" },
          "여드름·흉터": { label: "สิว/รอยแผล", hint: "รอยสิว รอยแดง สิวซ้ำ" },
          "회복/항노화": { label: "ฟื้นฟู/ชะลอวัย", hint: "สภาพผิว การฟื้นตัว การดูแลชะลอวัย" },
          바디라인: { label: "รูปร่าง", hint: "เหนียง หน้าท้อง แขน ต้นขา" },
        },
      },
      budget: {
        title: "งบประมาณครั้งนี้ประมาณเท่าไร?",
        subtitle: "ระบบจะเลือกตัวเลือกที่เหมาะกับงบรวมก่อน และลดลำดับชุดที่เกินงบ",
        options: {
          "50": { label: "ต่ำกว่า ₩500,000", hint: "หัตถการเริ่มต้นหรือดูแลเดี่ยว" },
          "80": { label: "ประมาณ ₩800,000", hint: "พิจารณาชุดเบาๆ ได้" },
          "120": { label: "ประมาณ ₩1,200,000", hint: "สมดุลระหว่างผลลัพธ์และความมั่นคง" },
          "180": { label: "ประมาณ ₩1,800,000", hint: "สำรวจชุดระดับกลางถึงสูง" },
          "250": { label: "₩2,500,000 ขึ้นไป", hint: "รวมลิฟติ้งราคาสูงและแพ็กเกจ" },
        },
      },
      age: {
        title: "ช่วงอายุของคุณใกล้เคียงข้อใด?",
        subtitle: "อายุเป็นข้อมูลอ้างอิงเพื่อปรับความเข้มของคำแนะนำเท่านั้น",
        options: {
          "20대": { label: "20s", hint: "ป้องกันและปรับเบาๆ" },
          "30대": { label: "30s", hint: "ปรับอย่างเป็นธรรมชาติและดูแลต่อเนื่อง" },
          "40대": { label: "40s", hint: "พิจารณาความหย่อนและความยืดหยุ่นร่วมกัน" },
          "50대 이상": { label: "50s+", hint: "พิจารณาผลลัพธ์และเงื่อนไขพักฟื้น" },
        },
      },
      goal: {
        title: "ผลลัพธ์ที่ต้องการมากที่สุดคืออะไร?",
        subtitle: "แม้งบเท่ากัน ชุดแนะนำจะต่างกันตามระดับผลลัพธ์ที่ต้องการ",
        options: {
          "자연스럽게 정리": { label: "ปรับอย่างธรรมชาติ", hint: "เปลี่ยนแบบไม่ชัดเกินไป" },
          "확실한 변화": { label: "เห็นการเปลี่ยนแปลงชัด", hint: "ผลลัพธ์ที่รู้สึกและมองเห็นได้" },
          "가성비 중심": { label: "เน้นคุ้มค่า", hint: "ประสิทธิภาพรวมและค่าดูแลต่อเนื่อง" },
          "시술 입문": { label: "ครั้งแรก", hint: "ประสบการณ์แรกที่ภาระต่ำ" },
        },
      },
      downtime: {
        title: "รับเวลาพักฟื้นได้แค่ไหน?",
        subtitle: "เป็นเกณฑ์สำคัญในการเลือกระหว่างภาระพักฟื้นกับผลลัพธ์",
        options: {
          low: { label: "แทบไม่มีจะดีที่สุด", hint: "กลับไปใช้ชีวิตประจำวันในวันเดียวสำคัญ" },
          medium: { label: "สองสามวันได้", hint: "รับบวมและช้ำเล็กน้อยได้" },
          high: { label: "ยอมรับได้ถ้าผลดี", hint: "ให้ผลลัพธ์สำคัญกว่าการพักฟื้น" },
        },
      },
    },
  },
};

const stepLabels: Record<SupportedLanguage, string> = {
  ko: "단계",
  en: "step",
  zh: "步骤",
  ja: "ステップ",
  th: "ขั้นตอน",
};

const engineLabels: Record<SupportedLanguage, string> = {
  ko: "추천 엔진",
  en: "recommendation engine",
  zh: "推荐引擎",
  ja: "推薦エンジン",
  th: "ระบบแนะนำ",
};

const questionCopyLanguage: Record<SupportedLanguage, SupportedLanguage | null> = {
  ko: null,
  en: "en",
  zh: "ko",
  ja: "zh",
  th: "ja",
};

function localizeQuestions(language: SupportedLanguage) {
  const sourceLanguage = questionCopyLanguage[language];
  const localized = sourceLanguage ? recommendCopy[sourceLanguage].questions : {};

  return questions.map((question) => {
    const copy = localized[question.key];
    if (!copy) return question;

    return {
      ...question,
      title: copy.title,
      subtitle: copy.subtitle,
      options: question.options.map((option) => ({
        ...option,
        label: question.key === "budget" ? `≤ ${formatPrice(Number(option.value), language)}` : copy.options[option.value]?.label ?? option.label,
        hint: copy.options[option.value]?.hint ?? option.hint,
      })),
    };
  });
}

const initialAnswers: Record<QuestionKey, string> = {
  concern: "",
  budget: "",
  age: "",
  goal: "",
  downtime: "",
};

function getRequestHref(result: RecommendationResult, answers: Record<QuestionKey, string>) {
  const params = new URLSearchParams({
    category: result.requestCategory,
    budget: answers.budget,
    concern: answers.concern,
    symptom: result.requestSummary,
    recommended: result.items.map((item) => item.name).join(", "),
  });

  return `/request?${params.toString()}`;
}

export default function RecommendPage() {
  const { language } = useLanguage();
  const copy = recommendCopy[language];
  const ui = commonUi[language];
  const localizedQuestions = localizeQuestions(language);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  const activeQuestion = localizedQuestions[stepIndex];
  const isComplete = Boolean(result);

  const submitRecommendation = async (nextAnswers: Record<QuestionKey, string>) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 40000);
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/recommend-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextAnswers, language }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "추천 생성 실패");
      }

      if (!Array.isArray(data.items) || typeof data.totalPrice !== "number") throw new Error("Invalid result");
      if (requestRef.current === controller) setResult(data);
    } catch (error) {
      if (requestRef.current === controller) setErrorMessage(error instanceof Error && error.name !== "AbortError" ? error.message : copy.alerts.fail);
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) { setLoading(false); requestRef.current = null; }
    }
  };

  const handleOptionSelect = (value: string) => {
    if (!activeQuestion || loading) return;
    setErrorMessage("");

    const nextAnswers = {
      ...answers,
      [activeQuestion.key]: value,
    };

    setAnswers(nextAnswers);

    if (stepIndex === localizedQuestions.length - 1) {
      void submitRecommendation(nextAnswers);
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setErrorMessage("");
    setAnswers(initialAnswers);
    setResult(null);
    setLoading(false);
    setStepIndex(0);
  };

  const handleBack = () => {
    if (loading) return;
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="pb-12">
      <header className="sticky top-4 z-30">
        <div className="shell flex min-h-[64px] items-center justify-between rounded-full border border-[rgba(23,21,14,0.08)] bg-white/88 px-4 py-2 backdrop-blur">
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
          <Link href="/clinics" className="ghost-link">{language === "ko" ? "서울 경험 추천" : "Seoul guide"}</Link>
          <button onClick={handleRestart} className="ghost-link">
            {ui.restart}
          </button>
        </div>
      </header>

      <main className="shell pt-8">
        <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[36px] bg-white p-5 sm:p-8">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4rem]" data-display="true">
              {copy.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="mt-7 type-copy">{copy.intro}</p>

            <div className="mt-10 hidden gap-3 xl:grid">
              {localizedQuestions.map((question, index) => {
                const isActive = index === stepIndex && !loading && !isComplete;
                const value = answers[question.key];
                const displayValue = question.options.find((option) => option.value === value)?.label ?? value;

                return (
                  <article
                    key={question.key}
                    className={`rounded-3xl px-4 py-4 ${isActive ? "bg-[var(--color-genius-yellow)] text-[var(--color-carbon)]" : "bg-[var(--color-porcelain-gray)] text-[var(--color-muted)]"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[11px] uppercase tracking-[0.22em]">{question.shortLabel}</span>
                      <span className="text-[11px] uppercase tracking-[0.22em]">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-3 text-[14px] font-semibold leading-6">{displayValue || question.title}</p>
                  </article>
                );
              })}
            </div>
          </aside>

          <section className="min-h-[720px] rounded-[36px] bg-white p-5 sm:p-8">
            {errorMessage && <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm"><p>{errorMessage}</p><button className="mt-3 font-semibold underline" onClick={() => void submitRecommendation(answers)}>{language === "ko" ? "입력 유지하고 다시 시도" : "Try again"}</button></div>}
            {!loading && !isComplete && activeQuestion && (
              <div className="animate-fade-up flex min-h-[660px] flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">
                      {stepLabels[language]} {stepIndex + 1}
                    </p>
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
                      {stepIndex + 1}/{localizedQuestions.length}
                    </p>
                  </div>

                  <h2 className="type-section mt-8 max-w-[920px]" data-display="true">
                    {activeQuestion.title}
                  </h2>
                  <p className="mt-5 max-w-[760px] type-copy">{activeQuestion.subtitle}</p>

                  <div className="mt-10 grid gap-3 md:grid-cols-2">
                    {activeQuestion.options.map((option) => {
                      const isSelected = answers[activeQuestion.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleOptionSelect(option.value)}
                          aria-pressed={isSelected}
                          className={`option-card min-h-[170px] ${
                            isSelected ? "option-card-active" : ""
                          }`}
                        >
                          <span className="block text-[1.4rem] font-normal leading-tight" data-display="true">
                            {option.label}
                          </span>
                          <span className="mt-5 block text-[13px] leading-6 opacity-70">{option.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-5">
                  <button onClick={handleBack} disabled={stepIndex === 0} className="ghost-link disabled:opacity-30">
                    {copy.previous}
                  </button>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">
                    {copy.autoResult}
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div role="status" aria-live="polite" className="flex min-h-[660px] flex-col items-center justify-center text-center animate-fade-up">
                <p className="eyebrow">{engineLabels[language]}</p>
                <h2 className="type-section mt-8" data-display="true">
                  {copy.loadingTitle.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h2>
              </div>
            )}

            {isComplete && result && (
              <div className="animate-fade-up">
                <p className="eyebrow">{copy.resultEyebrow}</p>
                <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
                  <div>
                    <h2 className="type-section" data-display="true">
                      {result.strategyTitle}
                    </h2>
                    <p className="mt-5 type-copy">{result.summary}</p>
                  </div>
                  <div className="rounded-[28px] bg-[var(--color-porcelain-gray)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                      {copy.estimatedTotal}
                    </p>
                    <p className="mt-6 text-[2.2rem] font-normal leading-none" data-display="true">
                      {formatPrice(result.totalPrice, language)}
                    </p>
                    <p className="mt-3 text-xs leading-6 text-[var(--color-muted)]">{language === "ko" ? "등록 가격 범위 중간값의 합계입니다. 실제 견적·시술 필요성은 상담에서 확인해 주세요." : "Sum of catalog range midpoints. Confirm actual quotes and suitability during consultation."}</p>
                    {result.totalPriceRange && <p className="mt-2 text-sm">{formatPrice(result.totalPriceRange.min, language)} ~ {formatPrice(result.totalPriceRange.max, language)}</p>}
                    <Link href={getRequestHref(result, answers)} className="action-primary mt-8 w-full">
                      {copy.requestCta}
                    </Link>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 xl:grid-cols-3">
                  {result.items.map((item) => (
                    <article key={item.name} className="rounded-[28px] border border-[var(--color-silver-mist)] bg-white p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                        {localizeCategoryName(item.category, language)}
                      </p>
                      <h3 className="mt-8 text-[1.7rem] font-normal leading-tight" data-display="true">
                        {item.name}
                      </h3>
                      <p className="mt-4 text-[1.1rem] font-semibold">{formatPrice(item.price, language)}</p>
                      <p className="mt-5 text-[13px] leading-6 text-[var(--color-muted)]">{item.description}</p>
                      <div className="mt-6 space-y-3 text-[13px] leading-6">
                        <p>
                          <span className="font-semibold">{copy.resultLabels.reason}</span> {item.reason}
                        </p>
                        <p>
                          <span className="font-semibold">{copy.resultLabels.recovery}</span> {item.recovery}
                        </p>
                        <p>
                          <span className="font-semibold">{copy.resultLabels.caution}</span> {item.sideEffects}
                        </p>
                      </div>
                      <Link href={`/clinics?q=${encodeURIComponent(item.name)}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{language === "ko" ? "관련 서울 경험 추천 살펴보기" : "Explore Seoul experience notes"} →</Link>
                    </article>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {[result.budgetFit, result.caution, ...(result.confidenceNotes || []).slice(0, 1)].map((note) => (
                    <article key={note} className="rounded-[24px] bg-[var(--color-porcelain-gray)] p-5">
                      <p className="text-[13px] leading-7 text-[var(--color-muted)]">{note}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
