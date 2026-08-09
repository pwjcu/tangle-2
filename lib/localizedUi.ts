import { displayCategoryName } from "./siteContent";
import type { SupportedLanguage } from "./i18n";

export const commonUi: Record<SupportedLanguage, Record<string, string>> = {
  ko: {
    back: "뒤로",
    restart: "다시 시작",
    requestQuote: "견적 요청",
    quoteCta: "견적 요청으로 이동",
    loading: "불러오는 중입니다.",
    noData: "데이터가 없습니다.",
    consultAfterConfirm: "상담 후 확인",
    standalonePossible: "단독 진행 가능",
    none: "미정",
    open: "열기",
    comingSoon: "연결 예정",
    budget: "예산",
    price: "가격",
    recovery: "회복",
    action: "실행",
    reason: "추천 이유",
    caution: "주의",
  },
  en: {
    back: "Back",
    restart: "Restart",
    requestQuote: "Request Quote",
    quoteCta: "Go to Quote Request",
    loading: "Loading...",
    noData: "No data available.",
    consultAfterConfirm: "Confirm after consultation",
    standalonePossible: "Can be done alone",
    none: "Not set",
    open: "Open",
    comingSoon: "Coming soon",
    budget: "Budget",
    price: "Price",
    recovery: "Recovery",
    action: "Action",
    reason: "Reason",
    caution: "Caution",
  },
  zh: {
    back: "返回",
    restart: "重新开始",
    requestQuote: "申请报价",
    quoteCta: "前往申请报价",
    loading: "正在加载...",
    noData: "暂无数据。",
    consultAfterConfirm: "咨询后确认",
    standalonePossible: "可单独进行",
    none: "未定",
    open: "打开",
    comingSoon: "即将连接",
    budget: "预算",
    price: "价格",
    recovery: "恢复",
    action: "操作",
    reason: "推荐理由",
    caution: "注意",
  },
  ja: {
    back: "戻る",
    restart: "再開",
    requestQuote: "見積依頼",
    quoteCta: "見積依頼へ",
    loading: "読み込み中です。",
    noData: "データがありません。",
    consultAfterConfirm: "相談後に確認",
    standalonePossible: "単独施術も可能",
    none: "未定",
    open: "開く",
    comingSoon: "連携予定",
    budget: "予算",
    price: "価格",
    recovery: "回復",
    action: "操作",
    reason: "推薦理由",
    caution: "注意",
  },
  th: {
    back: "กลับ",
    restart: "เริ่มใหม่",
    requestQuote: "ขอใบเสนอราคา",
    quoteCta: "ไปที่คำขอราคา",
    loading: "กำลังโหลด...",
    noData: "ไม่มีข้อมูล",
    consultAfterConfirm: "ยืนยันหลังปรึกษา",
    standalonePossible: "ทำเดี่ยวได้",
    none: "ยังไม่ระบุ",
    open: "เปิด",
    comingSoon: "จะเชื่อมต่อเร็วๆ นี้",
    budget: "งบประมาณ",
    price: "ราคา",
    recovery: "พักฟื้น",
    action: "การดำเนินการ",
    reason: "เหตุผลที่แนะนำ",
    caution: "ข้อควรระวัง",
  },
};

export const categoryNames: Record<SupportedLanguage, Record<string, string>> = {
  ko: {
    리프팅: "리프팅",
    스킨부스터: "스킨부스터",
    보톡스: "보톡스",
    관리: "관리",
    "색소/레이저": "색소/레이저",
    "모공/흉터": "모공/흉터",
    모공흉터: "모공/흉터",
    바디라인: "바디라인",
    제모: "제모",
    기타: "기타",
  },
  en: {
    리프팅: "Lifting",
    스킨부스터: "Skin boosters",
    보톡스: "Botox",
    관리: "Care",
    "색소/레이저": "Pigment/laser",
    "모공/흉터": "Pores/scars",
    모공흉터: "Pores/scars",
    바디라인: "Body contour",
    제모: "Hair removal",
    기타: "Other",
  },
  zh: {
    리프팅: "提升",
    스킨부스터: "皮肤再生/水光",
    보톡스: "肉毒",
    관리: "护理",
    "색소/레이저": "色素/激光",
    "모공/흉터": "毛孔/痘疤",
    모공흉터: "毛孔/痘疤",
    바디라인: "身体线条",
    제모: "脱毛",
    기타: "其他",
  },
  ja: {
    리프팅: "リフトアップ",
    스킨부스터: "スキンブースター",
    보톡스: "ボトックス",
    관리: "ケア",
    "색소/레이저": "色素/レーザー",
    "모공/흉터": "毛穴/傷跡",
    모공흉터: "毛穴/傷跡",
    바디라인: "ボディライン",
    제모: "脱毛",
    기타: "その他",
  },
  th: {
    리프팅: "ยกกระชับ",
    스킨부스터: "สกินบูสเตอร์",
    보톡스: "โบท็อกซ์",
    관리: "ดูแลผิว",
    "색소/레이저": "เม็ดสี/เลเซอร์",
    "모공/흉터": "รูขุมขน/รอยแผล",
    모공흉터: "รูขุมขน/รอยแผล",
    바디라인: "รูปร่าง",
    제모: "กำจัดขน",
    기타: "อื่นๆ",
  },
};

export function localizeCategoryName(name: string, language: SupportedLanguage) {
  const displayName = displayCategoryName(name);
  return categoryNames[language][displayName] ?? categoryNames[language][name] ?? displayName;
}

export function formatPrice(value: number, language: SupportedLanguage) {
  if (language === "ko") return `${value.toLocaleString()}만원`;
  return `₩${(value * 10000).toLocaleString()}`;
}

export function formatPriceRange(min: number, max: number, language: SupportedLanguage) {
  if (language === "ko") return `${min.toLocaleString()}~${max.toLocaleString()}만원`;
  return `₩${(min * 10000).toLocaleString()}~₩${(max * 10000).toLocaleString()}`;
}

export function formatCount(value: number, language: SupportedLanguage) {
  if (language === "ko") return `${value}건`;
  if (language === "zh") return `${value}项`;
  if (language === "ja") return `${value}件`;
  return String(value);
}

const dateLocales: Record<SupportedLanguage, string> = {
  ko: "ko-KR",
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  th: "th-TH",
};

export function formatDate(value: string | Date, language: SupportedLanguage) {
  return new Date(value).toLocaleDateString(dateLocales[language]);
}
