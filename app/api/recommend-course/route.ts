import { NextResponse } from "next/server";
import { type SupportedLanguage } from "../../../lib/i18n";
import { formatPrice, localizeCategoryName } from "../../../lib/localizedUi";
import { loadConsultTreatments } from "../../../lib/상담시술자료";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody, readConsultChoice } from "../../../lib/상담입력검증";

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
  "피부결·모공": ["관리", "모공흉터", "스킨부스터"],
  "톤업/색소": ["관리", "스킨부스터", "색소/레이저"],
  "여드름·흉터": ["모공흉터", "관리"],
  "회복/항노화": ["관리", "스킨부스터"],
  "바디라인": ["바디라인"],
};

const concernLabels: Record<SupportedLanguage, Record<string, string>> = {
  ko: {
    "탄력/리프팅": "탄력/리프팅",
    "주름/노화": "주름/노화",
    "피부결·모공": "피부결·모공",
    "톤업/색소": "톤업/색소",
    "여드름·흉터": "여드름·흉터",
    "회복/항노화": "회복/항노화",
    바디라인: "바디라인",
  },
  en: {
    "탄력/리프팅": "elasticity/lifting",
    "주름/노화": "wrinkles/aging",
    "피부결·모공": "texture/pores",
    "톤업/색소": "tone/pigment",
    "여드름·흉터": "acne/scars",
    "회복/항노화": "recovery/anti-aging",
    바디라인: "body contour",
  },
  zh: {
    "탄력/리프팅": "弹力/提升",
    "주름/노화": "皱纹/老化",
    "피부결·모공": "肤质/毛孔",
    "톤업/색소": "提亮/色素",
    "여드름·흉터": "痘痘/痘疤",
    "회복/항노화": "恢复/抗老",
    바디라인: "身体线条",
  },
  ja: {
    "탄력/리프팅": "弾力/リフト",
    "주름/노화": "しわ/老化",
    "피부결·모공": "肌質/毛穴",
    "톤업/색소": "トーン/色素",
    "여드름·흉터": "ニキビ/跡",
    "회복/항노화": "回復/抗老化",
    바디라인: "ボディライン",
  },
  th: {
    "탄력/리프팅": "ความยืดหยุ่น/ยกกระชับ",
    "주름/노화": "ริ้วรอย/วัย",
    "피부결·모공": "ผิวสัมผัส/รูขุมขน",
    "톤업/색소": "โทนผิว/เม็ดสี",
    "여드름·흉터": "สิว/รอยแผล",
    "회복/항노화": "ฟื้นฟู/ชะลอวัย",
    바디라인: "รูปร่าง",
  },
};

const fallbackCopy: Record<
  SupportedLanguage,
  {
    strategyTitle: (concern: string) => string;
    summary: string;
    budgetFit: (totalPrice: number, budget: number) => string;
    caution: string;
    confidenceNotes: (concern: string) => string[];
    requestSummary: (concern: string, names: string) => string;
    itemDescription: (name: string, category: string) => string;
    itemReason: (category: string) => string;
    defaultReason: string;
    recoveryUnknown: string;
    sideEffectsUnknown: string;
    sideEffectsGeneric: string;
    synergyStandalone: string;
  }
> = {
  ko: {
    strategyTitle: (concern) => `${concern} 상담 후보`,
    summary:
      "등록된 가격 범위와 회복 정보로 좁힌 상담 후보입니다. 동시 시술의 적합성이나 효과를 확인한 조합은 아니며, 각 후보의 필요성을 진료에서 확인해주세요.",
    budgetFit: (totalPrice, budget) =>
      `표시 금액 ${formatPrice(totalPrice, "ko")}은 등록 가격 범위 중간값의 합계이며 실제 평균이나 견적이 아닙니다. 가격 범위 상한의 합계가 ${formatPrice(budget, "ko")} 이내인 후보만 담았습니다. 규격·부가세·추가 비용은 상담에서 확인해주세요.`,
    caution:
      "실제 피부 상태, 통증 민감도, 기존 시술 이력에 따라 최종 선택은 달라질 수 있습니다. 병원 상담에서 적합성과 불필요한 시술 여부를 다시 확인하세요.",
    confidenceNotes: (concern) => [
      `${concern} 고민과 맞는 카테고리를 우선 선별했습니다.`,
      "등록 가격 범위 상한을 합산해 예산 이내인 후보만 담았습니다.",
      "회복 기간 자료와 선택 조건을 함께 비교했습니다. 실제 회복에는 개인차가 있습니다.",
    ],
    requestSummary: (concern, names) =>
      `${concern} 고민이 있어 ${names}의 필요성과 적합성을 각각 상담하고 싶습니다. 동시에 받는다는 전제가 아니며 불필요한 시술은 제외하고 예산 안에서 검토하고 싶습니다.`,
    itemDescription: (name, category) => `${name}은 ${category} 카테고리에서 선택된 추천 후보입니다.`,
    itemReason: (category) => `${category} 고민과 예산 기준에 부합`,
    defaultReason: "고민과 예산 기준에 부합",
    recoveryUnknown: "상담 후 확인 필요",
    sideEffectsUnknown: "상담 후 확인 필요",
    sideEffectsGeneric: "상담 시 부작용과 개인별 반응 확인 필요",
    synergyStandalone: "조합 적합성은 진료에서 확인 필요",
  },
  en: {
    strategyTitle: (concern) => `Consultation candidates for ${concern}`,
    summary:
      "These consultation candidates match the recorded price and recovery criteria. Their individual suitability and compatibility have not been established by an examination.",
    budgetFit: (totalPrice, budget) =>
      `The displayed ${formatPrice(totalPrice, "en")} sums catalog range midpoints, not observed averages or a quote. The sum of upper bounds stays within ${formatPrice(budget, "en")}; confirm specifications, tax and extra costs with the clinic.`,
    caution:
      "The final choice can change by skin condition, pain sensitivity, and previous treatment history. Please confirm suitability and avoid unnecessary procedures during clinic consultation.",
    confidenceNotes: (concern) => [
      `Categories related to ${concern} were prioritized.`,
      "The sum of recorded upper price bounds stays within the budget.",
      "Recorded recovery times were filtered by your preference; actual recovery varies.",
    ],
    requestSummary: (concern, names) =>
      `I want to discuss whether each of ${names} is needed for my ${concern} concern. This is not a request to receive them together. Please exclude unnecessary procedures and keep within my budget.`,
    itemDescription: (name, category) => `${name} is a candidate selected from the ${category} category.`,
    itemReason: (category) => `Matches the selected concern and ${category} budget range`,
    defaultReason: "Matches the concern and budget criteria",
    recoveryUnknown: "Confirm after consultation",
    sideEffectsUnknown: "Confirm after consultation",
    sideEffectsGeneric: "Confirm possible side effects and personal reactions during consultation",
    synergyStandalone: "Confirm treatment compatibility during consultation",
  },
  zh: {
    strategyTitle: (concern) => `${concern} 咨询候选`,
    summary: "候选项目依据已登记的价格范围与恢复信息筛选，尚未确认个人适合性或组合适合性，请逐项咨询医生。",
    budgetFit: (totalPrice, budget) =>
      `显示金额 ${formatPrice(totalPrice, "zh")} 是登记价格区间中点之和，并非实测平均或报价。价格上限合计不超过 ${formatPrice(budget, "zh")}；规格、税费及附加费用需面诊确认。`,
    caution: "最终选择会因皮肤状态、疼痛敏感度和既往项目经历而变化。请在医院咨询时再次确认适合度和是否有不必要项目。",
    confidenceNotes: (concern) => [
      `优先筛选与 ${concern} 相关的类别。`,
      "登记价格上限合计不超过预算。",
      "按恢复期条件筛选，实际恢复存在个人差异。",
    ],
    requestSummary: (concern, names) => `我有 ${concern} 方面的烦恼，想优先咨询 ${names} 组合。希望排除过度项目，并在预算内咨询。`,
    itemDescription: (name, category) => `${name} 是从 ${category} 类别中选出的推荐候选。`,
    itemReason: (category) => `符合所选烦恼和 ${category} 预算范围`,
    defaultReason: "符合烦恼和预算标准",
    recoveryUnknown: "咨询后确认",
    sideEffectsUnknown: "咨询后确认",
    sideEffectsGeneric: "请在咨询时确认可能副作用和个人反应",
    synergyStandalone: "组合适合性需面诊确认",
  },
  ja: {
    strategyTitle: (concern) => `${concern} 中心の個別推薦`,
    summary: "登録済みの価格範囲と回復情報に基づく相談候補です。個人への適合性や併用の適合性は診察で確認してください。",
    budgetFit: (totalPrice, budget) =>
      `表示額 ${formatPrice(totalPrice, "ja")} は価格範囲の中点の合計で、実測平均や見積りではありません。上限額の合計は予算 ${formatPrice(budget, "ja")} 以内です。規格・税・追加費用は相談で確認してください。`,
    caution: "実際の肌状態、痛みへの敏感さ、過去の施術歴によって最終選択は変わります。クリニック相談で適合性と不要な施術の有無を確認してください。",
    confidenceNotes: (concern) => [
      `${concern} の悩みに関連するカテゴリを優先しました。`,
      "登録価格の上限合計が予算内の候補に限定しました。",
      "登録回復期間で絞り込みました。実際の回復には個人差があります。",
    ],
    requestSummary: (concern, names) => `${concern} の悩みがあり、${names} の組み合わせを優先して相談したいです。過度な施術は除き、予算内で相談したいです。`,
    itemDescription: (name, category) => `${name} は ${category} カテゴリから選ばれた推薦候補です。`,
    itemReason: (category) => `選択した悩みと ${category} の予算条件に合います`,
    defaultReason: "悩みと予算条件に合います",
    recoveryUnknown: "相談後に確認",
    sideEffectsUnknown: "相談後に確認",
    sideEffectsGeneric: "相談時に副作用と個人差を確認してください",
    synergyStandalone: "併用の適合性は相談で確認",
  },
  th: {
    strategyTitle: (concern) => `ชุดแนะนำสำหรับ${concern}`,
    summary: "ตัวเลือกสำหรับปรึกษานี้คัดจากช่วงราคาและข้อมูลการพักฟื้นที่บันทึกไว้ ต้องให้แพทย์ยืนยันความเหมาะสมเฉพาะบุคคลและการทำร่วมกัน",
    budgetFit: (totalPrice, budget) =>
      `ยอด ${formatPrice(totalPrice, "th")} เป็นผลรวมจุดกึ่งกลางช่วงราคา ไม่ใช่ราคาเฉลี่ยจริงหรือใบเสนอราคา ผลรวมราคาสูงสุดไม่เกิน ${formatPrice(budget, "th")} โปรดยืนยันรายละเอียด ภาษี และค่าใช้จ่ายเพิ่มเติม`,
    caution: "ตัวเลือกสุดท้ายอาจเปลี่ยนตามสภาพผิว ความไวต่อความเจ็บ และประวัติการทำหัตถการ โปรดยืนยันความเหมาะสมและตัดตัวเลือกที่ไม่จำเป็นระหว่างปรึกษาคลินิก",
    confidenceNotes: (concern) => [
      `คัดเลือกหมวดที่เกี่ยวข้องกับ${concern}ก่อน`,
      "ตรวจตัวเลือกที่จัดชุดได้ในงบประมาณก่อน",
      "ลดลำดับหัตถการที่หนักเกินไปตามเงื่อนไขเวลาพักฟื้น",
    ],
    requestSummary: (concern, names) => `ฉันมีปัญหาเรื่อง${concern} และอยากปรึกษาชุด ${names} ก่อน กรุณาตัดหัตถการที่มากเกินไปและแนะนำภายในงบประมาณ`,
    itemDescription: (name, category) => `${name} เป็นตัวเลือกที่คัดจากหมวด${category}`,
    itemReason: (category) => `เหมาะกับปัญหาที่เลือกและช่วงงบของหมวด${category}`,
    defaultReason: "เหมาะกับปัญหาและงบประมาณที่เลือก",
    recoveryUnknown: "ยืนยันหลังปรึกษา",
    sideEffectsUnknown: "ยืนยันหลังปรึกษา",
    sideEffectsGeneric: "โปรดยืนยันผลข้างเคียงและปฏิกิริยาที่อาจต่างกันในแต่ละคนระหว่างปรึกษา",
    synergyStandalone: "ยืนยันความเหมาะสมของการทำร่วมกันกับแพทย์",
  },
};

const sideEffectTerms: Record<Exclude<SupportedLanguage, "ko">, Record<string, string>> = {
  en: {
    붓기: "swelling",
    멍: "bruising",
    홍반: "redness",
    붉어짐: "redness",
    따가움: "stinging",
    통증: "pain",
    열감: "heat sensation",
    건조: "dryness",
    딱지: "scabbing",
    색소침착: "hyperpigmentation",
    주사자국: "needle marks",
    모낭염: "folliculitis",
    압통: "tenderness",
    화상: "burns",
    지방위축: "fat atrophy",
    염증: "inflammation",
    감염: "infection",
    알레르기: "allergy",
    어지러움: "dizziness",
    메스꺼움: "nausea",
    저림: "numbness",
    개인차: "individual variation",
    가능성: "possible",
    드물게: "rarely",
    일시적: "temporary",
  },
  zh: {
    붓기: "肿胀",
    멍: "淤青",
    홍반: "泛红",
    붉어짐: "泛红",
    따가움: "刺痛",
    통증: "疼痛",
    열감: "热感",
    건조: "干燥",
    딱지: "结痂",
    색소침착: "色沉",
    주사자국: "针孔痕迹",
    모낭염: "毛囊炎",
    압통: "压痛",
    화상: "灼伤",
    지방위축: "脂肪萎缩",
    염증: "炎症",
    감염: "感染",
    알레르기: "过敏",
    어지러움: "头晕",
    메스꺼움: "恶心",
    저림: "麻木",
    개인차: "个体差异",
    가능성: "可能",
    드물게: "少见",
    일시적: "暂时",
  },
  ja: {
    붓기: "腫れ",
    멍: "内出血",
    홍반: "赤み",
    붉어짐: "赤み",
    따가움: "ひりつき",
    통증: "痛み",
    열감: "熱感",
    건조: "乾燥",
    딱지: "かさぶた",
    색소침착: "色素沈着",
    주사자국: "注射跡",
    모낭염: "毛嚢炎",
    압통: "圧痛",
    화상: "やけど",
    지방위축: "脂肪萎縮",
    염증: "炎症",
    감염: "感染",
    알레르기: "アレルギー",
    어지러움: "めまい",
    메스꺼움: "吐き気",
    저림: "しびれ",
    개인차: "個人差",
    가능성: "可能性",
    드물게: "まれに",
    일시적: "一時的",
  },
  th: {
    붓기: "บวม",
    멍: "รอยช้ำ",
    홍반: "รอยแดง",
    붉어짐: "รอยแดง",
    따가움: "แสบ",
    통증: "ปวด",
    열감: "รู้สึกร้อน",
    건조: "แห้ง",
    딱지: "สะเก็ด",
    색소침착: "สีผิวเข้มขึ้น",
    주사자국: "รอยเข็ม",
    모낭염: "รูขุมขนอักเสบ",
    압통: "กดเจ็บ",
    화상: "แผลไหม้",
    지방위축: "ไขมันฝ่อ",
    염증: "การอักเสบ",
    감염: "การติดเชื้อ",
    알레르기: "อาการแพ้",
    어지러움: "เวียนศีรษะ",
    메스꺼움: "คลื่นไส้",
    저림: "ชา",
    개인차: "แตกต่างตามบุคคล",
    가능성: "อาจเกิด",
    드물게: "พบได้น้อย",
    일시적: "ชั่วคราว",
  },
};

function averagePrice(treatment: TreatmentRow) {
  return Math.round((treatment.price_min + treatment.price_max) * 5) / 10;
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
    reasons.push(`${concern} 고민과 직접적으로 연결되는 카테고리`);
  }

  if (treatment.price_max <= budget) {
    score += 3;
    reasons.push("예산 범위 안에서 조합 가능");
  }

  if (downtime === "low" && /(당일|즉시|다운타임 없음|거의 없음)/.test(recovery)) {
    score += 2;
    reasons.push("다운타임 부담이 비교적 적음");
  }

  if (downtime === "high" && !/(당일|즉시|다운타임 없음|거의 없음)/.test(recovery)) {
    score += 1;
    reasons.push("회복보다 효과를 우선하는 선택으로 검토 가능");
  }

  if (goal === "가성비 중심" && avgPrice <= budget) {
    score += 1;
  }

  if (goal === "확실한 변화" && treatment.category === "리프팅") {
    score += 1;
  }

  if (goal === "시술 입문" && /(진정|관리|입문|저자극|유지)/.test(description)) {
    score += 2;
    reasons.push("입문 단계에서 접근하기 쉬운 성격");
  }

  if ((age === "40대" || age === "50대 이상") && treatment.category === "리프팅") {
    score += 1;
  }

  if (concern === "여드름·흉터" && /(흉터|모공|여드름)/.test(description)) {
    score += 2;
  }

  if (
    concern === "회복/항노화" &&
    /(항노화|회복|수액|고압|산소|nad|nmn|글루타치온|컨디션|혈청|부스터)/.test(
      `${description} ${treatment.name}`.toLowerCase(),
    )
  ) {
    score += 2;
    reasons.push("등록 설명에 회복·항노화 관련 표현이 있음");
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

    const nextTotal = total + candidate.treatment.price_max;
    if (nextTotal <= budget) {
      selected.push(candidate);
      total = nextTotal;
    }
  }

  return { selected, total: Math.round(selected.reduce((sum, item) => sum + item.avgPrice, 0) * 10) / 10 };
}

function localizeConcern(concern: string, language: SupportedLanguage) {
  return concernLabels[language][concern] ?? concern;
}

function localizeRecovery(recovery: string | null, language: SupportedLanguage) {
  const copy = fallbackCopy[language];

  if (!recovery) return copy.recoveryUnknown;
  if (language === "ko") return recovery;

  const sameDay: Record<Exclude<SupportedLanguage, "ko">, string> = {
    en: "same day",
    zh: "当天",
    ja: "当日",
    th: "วันเดียวกัน",
  };
  const consult: Record<Exclude<SupportedLanguage, "ko">, string> = {
    en: "confirm after consultation",
    zh: "咨询后确认",
    ja: "相談後に確認",
    th: "ยืนยันหลังปรึกษา",
  };
  const dayUnit: Record<Exclude<SupportedLanguage, "ko">, string> = {
    en: "day",
    zh: "天",
    ja: "日",
    th: "วัน",
  };

  const target = language as Exclude<SupportedLanguage, "ko">;
  return recovery
    .replaceAll("상담 후 확인 필요", consult[target])
    .replaceAll("거의 없음", language === "en" ? "almost none" : language === "zh" ? "几乎没有" : language === "ja" ? "ほぼなし" : "แทบไม่มี")
    .replaceAll("당일", sameDay[target])
    .replace(/(\d+)~(\d+)일/g, (_, min: string, max: string) => `${min}~${max}${dayUnit[target]}`)
    .replace(/(\d+)일/g, (_, days: string) => `${days}${dayUnit[target]}`);
}

function localizeSideEffects(sideEffects: string | null, language: SupportedLanguage) {
  const copy = fallbackCopy[language];

  if (!sideEffects) return copy.sideEffectsUnknown;
  if (language === "ko") return sideEffects;

  const target = language as Exclude<SupportedLanguage, "ko">;
  let localized = sideEffects;
  const terms = Object.entries(sideEffectTerms[target]).sort((left, right) => right[0].length - left[0].length);

  for (const [source, translated] of terms) {
    localized = localized.replaceAll(source, translated);
  }

  return /[가-힣]/.test(localized) ? copy.sideEffectsGeneric : localized;
}

function buildFallbackResult(
  selected: ReturnType<typeof scoreTreatment>[],
  totalPrice: number,
  concern: string,
  budget: number,
  language: SupportedLanguage,
) {
  const copy = fallbackCopy[language];
  const localizedConcern = localizeConcern(concern, language);
  const selectedNames = selected.map((item) => item.treatment.name).join(", ");

  return {
    strategyTitle: copy.strategyTitle(localizedConcern),
    summary: copy.summary,
    budgetFit: copy.budgetFit(totalPrice, budget),
    caution: copy.caution,
    confidenceNotes: copy.confidenceNotes(localizedConcern),
    requestCategory: selected[0]?.treatment.category || "기타",
    requestSummary: copy.requestSummary(localizedConcern, selectedNames),
    totalPrice,
    items: selected.map((item) => {
      const category = localizeCategoryName(item.treatment.category, language);

      return {
        name: item.treatment.name,
        category: item.treatment.category,
        price: item.avgPrice,
        description: language === "ko" ? item.treatment.description : copy.itemDescription(item.treatment.name, category),
        reason: language === "ko" ? item.reasons[0] || copy.defaultReason : copy.itemReason(category),
        recovery: localizeRecovery(item.treatment.recovery, language),
        sideEffects: localizeSideEffects(item.treatment.side_effects, language),
        synergy: language === "ko" ? item.treatment.synergy || copy.synergyStandalone : copy.synergyStandalone,
      };
    }),
  };
}

export async function POST(req: Request) {
  try {
    const body = await readConsultBody(req);
    const age = readConsultChoice(body.age, ["20대", "30대", "40대", "50대 이상"], "나이대");
    const concern = readConsultChoice(body.concern, Object.keys(concernCategoryMap), "고민");
    const goal = readConsultChoice(body.goal, ["자연스럽게 정리", "확실한 변화", "가성비 중심", "시술 입문"], "목표");
    const downtime = readConsultChoice(body.downtime, ["low", "medium", "high"], "회복 기간") as DowntimeLevel;
    if ((typeof body.budget !== "number" && typeof body.budget !== "string") || String(body.budget).trim() === "") {
      throw new ConsultInputError("예산을 숫자로 입력해주세요.");
    }
    const budget = Number(body.budget);
    if (!Number.isFinite(budget) || budget < 1 || budget > 10_000) {
      throw new ConsultInputError("예산은 1~10,000만원 범위로 입력해주세요.");
    }
    const language = normalizeConsultLanguage(body.language);
    const treatments = await loadConsultTreatments();
    const concernKeywords: Record<string, RegExp> = {
      "피부결·모공": /피부결|모공|보습|피부\s?결|진정/,
      "톤업/색소": /색소|기미|잡티|톤|미백/,
      "여드름·흉터": /여드름|흉터|피지/,
      "회복/항노화": /회복|항노화|진정|컨디션/,
    };
    const candidates = treatments.filter((treatment) => {
      if (!concernCategoryMap[concern].includes(treatment.category)) return false;
      if (treatment.category === "관리" && concernKeywords[concern]
        && !concernKeywords[concern].test(`${treatment.description} ${treatment.recommended_for ?? ""}`)) return false;
      if (downtime === "high") return true;
      const recovery = treatment.recovery ?? "";
      if (/^(당일|즉시|거의 없음|다운타임 없음)$/.test(recovery.trim())) return true;
      const dayRange = recovery.match(/^(\d+)(?:[~\-–](\d+))?일$/);
      if (!dayRange) return false;
      const maxDays = Number(dayRange[2] ?? dayRange[1]);
      return maxDays <= (downtime === "low" ? 1 : 7);
    });
    const scored = candidates.map((treatment) => scoreTreatment(treatment, concern, budget, goal, downtime, age));
    const { selected, total } = choosePlan(scored, budget);
    if (selected.length === 0) {
      return NextResponse.json({ error: "현재 등록 자료에서 예산과 회복 조건을 함께 충족하는 후보를 찾지 못했습니다. 예산·회복 조건을 바꾸거나 병원 상담에서 확인해주세요." }, { status: 422 });
    }
    const fallback = buildFallbackResult(selected, total, concern, budget, language);
    // Candidate selection and all facts are deterministic. Survey responses stay out of external AI requests.
    return NextResponse.json({
      ...fallback,
      totalPriceRange: {
        min: Math.round(selected.reduce((sum, item) => sum + item.treatment.price_min, 0) * 10) / 10,
        max: Math.round(selected.reduce((sum, item) => sum + item.treatment.price_max, 0) * 10) / 10,
      },
      priceBasis: "catalog_range_midpoint",
      explanationSource: "catalog",
      items: fallback.items.map((item, index) => ({ ...item, priceMin: selected[index].treatment.price_min, priceMax: selected[index].treatment.price_max })),
    });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ error: known ? error.message : "추천 자료를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: known ? error.status : 500 });
  }
}
