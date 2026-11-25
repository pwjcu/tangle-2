import type { SupportedLanguage } from "./i18n";
import type { ConsultTreatment } from "./상담시술자료";

/** AI 도구(질문지·후기 체크·번역)의 AI 없이도 동작하는 대체 로직. */

export type QuestionSheet = { title: string; sections: { heading: string; items: string[] }[] };

const sheetHeadings: Record<SupportedLanguage, [string, string, string, string]> = {
  ko: ["원장님께 꼭 물어볼 것", "비용·견적 확인", "회복·부작용", "이런 말이 나오면 한 번 더 생각하기"],
  en: ["Ask the doctor", "Cost and quote", "Recovery and side effects", "Think twice if you hear this"],
  zh: ["一定要问医生的问题", "费用与报价", "恢复与副作用", "听到这些要多想一下"],
  ja: ["医師に必ず聞くこと", "費用・見積もり", "回復・副作用", "こんな言葉が出たら要注意"],
  th: ["สิ่งที่ต้องถามแพทย์", "ค่าใช้จ่ายและใบเสนอราคา", "การพักฟื้นและผลข้างเคียง", "ถ้าได้ยินแบบนี้ ให้คิดอีกครั้ง"],
};

const sheetBase: Record<SupportedLanguage, string[][]> = {
  ko: [
    ["수술·시술은 상담한 원장님이 직접 하나요? (대리 수술 여부)", "제 상태에 이 방법이 맞는 이유는 무엇인가요? 다른 방법은요?", "이 시술을 한 달에 몇 건 정도 하시나요?", "비슷한 경우의 전후 사진을 볼 수 있나요?"],
    ["견적에 포함된 것과 빠진 것(마취, 약, 재진, 사후관리)은 무엇인가요?", "VAT 포함 금액인가요?", "재수술·추가 시술이 필요하면 비용은 어떻게 되나요?", "오늘 결제해야만 받는 할인이라면, 이유를 물어보세요"],
    ["회복 기간과 일상·출근 복귀 시점은 언제인가요?", "자주 생기는 부작용과 드물지만 큰 부작용은 무엇인가요?", "문제가 생기면 연락은 누구에게, 몇 시까지 되나요?"],
    ["“무조건 안전해요”, “부작용 없어요”", "“오늘만 이 가격”", "원장님 상담 없이 상담실장만 길게 상담하는 경우"],
  ],
  en: [
    ["Will the doctor I consult perform the procedure personally?", "Why is this method right for me? What are the alternatives?", "How often do you perform this procedure?", "Can I see before/after photos of similar cases?"],
    ["What is included in the quote (anesthesia, medication, follow-ups, aftercare)?", "Does the price include 10% VAT?", "What does a revision or touch-up cost?", "If a discount is only for today, ask why"],
    ["How long is recovery, and when can I fly home?", "What are common and rare but serious side effects?", "Who do I contact if something goes wrong, and until what time?"],
    ["“It's 100% safe” or “no side effects”", "“This price is only for today”", "Only a coordinator consults you, never the doctor"],
  ],
  zh: [
    ["面诊的医生会亲自做手术/治疗吗？", "为什么这个方法适合我？还有其他方法吗？", "您每月做多少例这种手术/治疗？", "可以看类似案例的前后对比照片吗？"],
    ["报价包含哪些（麻醉、药物、复诊、术后护理）？", "价格含10%增值税吗？", "如需修复或补做，费用如何？", "如果折扣只限今天，请问清原因"],
    ["恢复期多久？什么时候可以坐飞机回国？", "常见副作用和少见但严重的副作用有哪些？", "出现问题时联系谁？几点前可以联系？"],
    ["“绝对安全”“没有副作用”", "“只有今天这个价格”", "只有咨询师面谈，医生从不出现"],
  ],
  ja: [
    ["相談した医師が直接施術しますか？", "なぜこの方法が私に合うのですか？他の方法は？", "この施術は月に何件くらい行っていますか？", "似たケースのビフォーアフター写真を見られますか？"],
    ["見積もりに含まれるもの（麻酔、薬、再診、アフターケア）は？", "VAT（10%）込みの金額ですか？", "再手術・追加施術が必要な場合の費用は？", "今日だけの割引なら、理由を聞きましょう"],
    ["回復期間と、飛行機に乗れる時期は？", "よくある副作用と、まれでも重い副作用は？", "問題が起きたら誰に、何時まで連絡できますか？"],
    ["「絶対安全」「副作用なし」", "「今日だけこの価格」", "医師の相談がなく、カウンセラーだけが長く説明する"],
  ],
  th: [
    ["แพทย์ที่ปรึกษาจะเป็นผู้ทำหัตถการเองหรือไม่?", "ทำไมวิธีนี้จึงเหมาะกับฉัน มีทางเลือกอื่นไหม?", "ทำหัตถการนี้กี่เคสต่อเดือน?", "ขอดูรูปก่อน-หลังของเคสที่คล้ายกันได้ไหม?"],
    ["ราคารวมอะไรบ้าง (ยาสลบ ยา การนัดติดตาม การดูแลหลังทำ)?", "ราคารวม VAT 10% แล้วหรือยัง?", "ถ้าต้องแก้ไขหรือทำเพิ่ม ค่าใช้จ่ายเท่าไร?", "ถ้าส่วนลดมีแค่วันนี้ ให้ถามเหตุผล"],
    ["พักฟื้นนานเท่าไร และบินกลับได้เมื่อไร?", "ผลข้างเคียงที่พบบ่อยและที่พบน้อยแต่รุนแรงมีอะไรบ้าง?", "ถ้ามีปัญหา ติดต่อใครได้ถึงกี่โมง?"],
    ["“ปลอดภัย 100%” หรือ “ไม่มีผลข้างเคียง”", "“ราคานี้เฉพาะวันนี้”", "มีแต่ผู้ประสานงานคุย ไม่ได้พบแพทย์เลย"],
  ],
};

export function localQuestionSheet(treatment: string, language: SupportedLanguage, data?: ConsultTreatment): QuestionSheet {
  const headings = sheetHeadings[language];
  const base = sheetBase[language].map((items) => [...items]);
  if (data && language === "ko") {
    if (data.recovery) base[2].unshift(`등록 자료상 회복: ${data.recovery} — 제 경우에도 같은가요?`);
    if (data.side_effects) base[2].unshift(`등록 자료상 주의사항(${data.side_effects}) 중 저에게 해당되는 것은?`);
    if (data.cycle) base[1].push(`유지 주기가 ${data.cycle}라면 1년 총비용은 얼마인가요?`);
  }
  const title = language === "ko" ? `${treatment || "상담"} 상담 질문지` : `${treatment || "Consultation"} — question sheet`;
  return { title, sections: headings.map((heading, index) => ({ heading, items: base[index] })) };
}

export type ReviewCheck = { score: number; verdict: string; signals: string[]; tips: string[] };

const reviewRules: { pattern: RegExp; weight: number; label: string }[] = [
  { pattern: /체험단|협찬|원고료|소정의|제공받아|지원받아|무료로\s*(받|시술)|광고\s*포함|유료\s*광고|sponsored|#ad\b|gifted/i, weight: 45, label: "협찬·체험단 표시가 있어요" },
  { pattern: /이벤트|할인\s*코드|쿠폰|예약은|문의는|링크|카톡\s*상담|DM\s*주세요/i, weight: 15, label: "예약·이벤트 유도 문구가 있어요" },
  { pattern: /인생\s*(병원|시술)|무조건|100\s*%|전혀\s*안\s*아|하나도\s*안\s*아|부작용\s*(전혀|하나도)\s*없|강력\s*추천|완전\s*강추|최고의/i, weight: 15, label: "과장된 표현이 많아요" },
  { pattern: /리뷰\s*이벤트|후기\s*이벤트|포인트\s*적립|적립금|사진\s*후기\s*(작성|조건)|모델\s*(모집|할인|가)|할인\s*받고|무료\s*시술\s*이벤트/, weight: 25, label: "후기 이벤트·모델 할인으로 쓴 글일 수 있어요" },
  { pattern: /실장님|상담실장/i, weight: 8, label: "상담실장 이름을 강조해요" },
  { pattern: /(원장님|선생님).{0,20}(원장님|선생님).{0,20}(원장님|선생님)/, weight: 6, label: "원장 칭찬이 반복돼요" },
];
const honestPattern = /아쉬|단점|불편|아팠|붓기|멍|오래\s*걸|비쌌|후회|재수술|별로/;
const detailPattern = /\d+\s*(만원|원|일|주|개월|회|cc|샷)/;

export function localReviewCheck(text: string): ReviewCheck {
  let score = 15;
  const signals: string[] = [];
  for (const rule of reviewRules) {
    if (rule.pattern.test(text)) { score += rule.weight; signals.push(rule.label); }
  }
  if (!honestPattern.test(text)) { score += 10; signals.push("단점·불편함 언급이 없어요"); } else { score -= 10; signals.push("단점·불편함도 함께 적혀 있어요"); }
  if (detailPattern.test(text)) { score -= 8; signals.push("가격·기간 같은 구체적인 숫자가 있어요"); }
  if (text.length < 80) signals.push("글이 짧아 판단 근거가 적어요");
  score = Math.max(0, Math.min(100, score));
  const verdict = score >= 60 ? "광고·체험단일 가능성이 높아요" : score >= 35 ? "광고성 표현이 섞여 있어요" : "실제 경험담에 가까워 보여요";
  return { score, verdict, signals, tips: ["같은 병원의 다른 후기에서 단점 언급이 있는지 비교해 보세요.", "후기 속 가격·회복 기간을 상담 때 직접 확인하세요."] };
}
