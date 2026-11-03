import { NextResponse } from "next/server";
import { type SupportedLanguage } from "../../../lib/i18n";
import { standardTreatmentPrices } from "../../../lib/시술표준가격";
import { loadConsultTreatments, type ConsultTreatment } from "../../../lib/상담시술자료";
import { ConsultInputError, normalizeConsultLanguage, readConsultBody, readConsultText } from "../../../lib/상담입력검증";
import { findClinicRecommendationText } from "../../../lib/서울경험추천";

function normalized(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
}

function priceReferences(message: string) {
  const query = normalized(message);
  return standardTreatmentPrices.filter((price) => [price.treatment_name, ...price.aliases]
    .some((name) => normalized(name).length >= 2 && query.includes(normalized(name))));
}

const localIntro: Record<SupportedLanguage, string> = {
  ko: "등록 자료에서 찾은 참고 정보입니다. 실시간 검색이나 개인별 진료 결과는 아닙니다.",
  en: "These are stored reference records, not live search results or an individual medical assessment. Source text may be in Korean.",
  zh: "以下是已登记的参考资料，并非实时搜索或个人医疗判断。原始资料可能为韩语。",
  ja: "登録済みの参考情報です。リアルタイム検索や個別の医療判断ではありません。原文は韓国語の場合があります。",
  th: "ข้อมูลนี้เป็นข้อมูลอ้างอิงที่บันทึกไว้ ไม่ใช่การค้นหาแบบสดหรือการประเมินทางการแพทย์เฉพาะบุคคล ข้อมูลต้นฉบับอาจเป็นภาษาเกาหลี",
};

function localReply(message: string, language: SupportedLanguage, treatments: ConsultTreatment[]) {
  const prices = priceReferences(message);
  const clinicText = findClinicRecommendationText(message);
  const isClinicQuestion = /병원|원장|의사|의원|명의|클리닉|어디|clinic|doctor/i.test(message);
  const isPriceQuestion = /가격|얼마|비용|견적|price|cost|budget/i.test(message);
  const query = normalized(message);
  const matched = treatments.filter((item) => query.includes(normalized(item.name))).slice(0, 3);
  if (clinicText && (isClinicQuestion || (!isPriceQuestion && matched.length === 0))) {
    return `${localIntro[language]}\n\n${clinicText}\n\n전체 경험추천: /clinics`;
  }
  if (prices.length && (isPriceQuestion || !matched.length)) {
    const rows = prices.slice(0, 8).map((price) => `${price.treatment_name} · ${price.variant}: ${price.min_price_manwon}~${price.max_price_manwon}만원 (${price.kind === "single" ? "단일" : price.kind === "package" ? "패키지" : price.kind === "combination" ? "복합" : "무제한권"})`);
    return `${localIntro[language]}\n\n${rows.join("\n")}\n\n2026-10-21 반영 사용자 제공 요약자료 · VAT 10% 별도. 규격·회차가 다른 가격은 직접 비교할 수 없으며 병원의 현재 견적과 다를 수 있습니다.${prices.length > 8 ? ` 나머지 ${prices.length - 8}개 규격은 가격표에서 확인해주세요.` : ""}\n전체 가격표: /prices`;
  }
  if (matched.length) {
    return `${localIntro[language]}\n\n${matched.map((item) => `${item.name}\n${item.description}\n등록 회복 정보: ${item.recovery || "미기재"}\n등록 주의사항: ${item.side_effects || "미기재"}`).join("\n\n")}\n\n시술 적합성과 개인별 회복은 진료에서 확인해주세요. 가격은 규격별 가격표(/prices)를 참고하세요.`;
  }
  const guidance: Record<SupportedLanguage, string> = {
    ko: "시술명과 궁금한 내용을 함께 적어주세요. 예: ‘리쥬란 가격’, ‘프로파운드 회복’, ‘창피부과 경험추천’. 서울 병원·원장 경험담은 /clinics, 규격별 가격은 /prices에서 볼 수 있습니다. 기록에 없는 병원·의사나 효능은 추측하지 않습니다.",
    en: "Please include a treatment or clinic name from the catalog, such as 리쥬란. See /clinics for Seoul experience notes and /prices for reference prices. We do not invent missing facts.",
    zh: "请填写目录中的项目或医院名称，例如 리쥬란。首尔经验记录见 /clinics，规格价格见 /prices。未记录的信息不会推测。",
    ja: "リストにある施術名や医院名（例: 리쥬란）を入力してください。ソウルの体験記録は /clinics、規格別価格は /prices で確認できます。未記載の情報は推測しません。",
    th: "โปรดระบุชื่อหัตถการหรือคลินิกจากรายการ เช่น 리쥬란 ดูบันทึกประสบการณ์ในโซลที่ /clinics และราคาอ้างอิงที่ /prices เราจะไม่คาดเดาข้อมูลที่ไม่มี",
  };
  return guidance[language];
}

export async function POST(req: Request) {
  let language: SupportedLanguage = "ko";
  try {
    const body = await readConsultBody(req);
    language = normalizeConsultLanguage(body.language);
    const message = readConsultText(body.message, "질문", 2_000);
    const treatments = await loadConsultTreatments();
    // Search stored references locally. Questions are never sent to an external AI provider.
    return NextResponse.json({ reply: localReply(message, language, treatments), source: "reference", aiAvailable: false });
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return NextResponse.json({ reply: known ? error.message : localIntro[language], source: "error" }, { status: known ? error.status : 500 });
  }
}