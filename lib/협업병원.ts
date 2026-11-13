import type { SupportedLanguage } from "./i18n";

/** 탱글과 협업하는 병원. 링크는 각 병원 공식 사이트·공식 링크모음에서 확인한 주소만 넣습니다. */
export type LocalizedText = Record<SupportedLanguage, string>;
export type PartnerLinkKind = "website" | "booking" | "naverBooking" | "instagram" | "whatsapp" | "line" | "kakao" | "price" | "phone";
export type PartnerLink = { kind: PartnerLinkKind; url: string; note?: LocalizedText };
export type PartnerClinic = {
  id: string;
  name: LocalizedText;
  area: LocalizedText;
  doctor: LocalizedText | null;
  highlights: LocalizedText;
  links: PartnerLink[];
};

export const partnerLinkLabels: Record<PartnerLinkKind, LocalizedText> = {
  website: { ko: "홈페이지", en: "Website", zh: "官网", ja: "公式サイト", th: "เว็บไซต์" },
  booking: { ko: "온라인 예약", en: "Book online", zh: "在线预约", ja: "オンライン予約", th: "จองออนไลน์" },
  naverBooking: { ko: "네이버 예약", en: "Naver booking", zh: "Naver 预约", ja: "Naver予約", th: "จองผ่าน Naver" },
  instagram: { ko: "인스타그램", en: "Instagram", zh: "Instagram", ja: "Instagram", th: "Instagram" },
  whatsapp: { ko: "왓츠앱 상담", en: "WhatsApp", zh: "WhatsApp 咨询", ja: "WhatsApp相談", th: "WhatsApp" },
  line: { ko: "라인 상담", en: "LINE", zh: "LINE 咨询", ja: "LINE相談", th: "LINE" },
  kakao: { ko: "카카오톡 상담", en: "KakaoTalk", zh: "KakaoTalk 咨询", ja: "カカオトーク相談", th: "KakaoTalk" },
  price: { ko: "가격표", en: "Price list", zh: "价格表", ja: "料金表", th: "ราคา" },
  phone: { ko: "전화", en: "Call", zh: "电话", ja: "電話", th: "โทร" },
};

export const partnerClinics: PartnerClinic[] = [
  {
    id: "daybeau-gangnam",
    name: { ko: "데이뷰의원 강남점", en: "Daybeau Clinic Gangnam", zh: "Daybeau 皮肤科 江南店", ja: "デイビュークリニック 江南店", th: "Daybeau Clinic สาขาคังนัม" },
    area: { ko: "신논현역 · 강남대로 494", en: "Sinnonhyeon Stn. · 494 Gangnam-daero", zh: "新论岘站 · 江南大路 494", ja: "新論峴駅 · 江南大路494", th: "สถานีซินนนฮยอน · 494 Gangnam-daero" },
    doctor: { ko: "대표원장 임정욱", en: "Head doctor: 임정욱 (Lim)", zh: "院长：임정욱", ja: "院長：임정욱", th: "แพทย์หัวหน้า: 임정욱" },
    highlights: {
      ko: "리프팅, 보톡스, 필러, 스킨부스터, 레이저 제모(젠틀맥스 프로플러스). 외국인 환자 비중이 높은 곳.",
      en: "Lifting, Botox, fillers, skin boosters and laser hair removal (GentleMax Pro Plus). Many international patients.",
      zh: "提升、肉毒、填充、皮肤水光/再生、激光脱毛（GentleMax Pro Plus）。外国患者比例高。",
      ja: "リフトアップ、ボトックス、フィラー、スキンブースター、レーザー脱毛（ジェントルマックスプロプラス）。外国人患者が多いクリニック。",
      th: "ยกกระชับ โบท็อกซ์ ฟิลเลอร์ สกินบูสเตอร์ และเลเซอร์กำจัดขน (GentleMax Pro Plus) มีผู้ป่วยต่างชาติจำนวนมาก",
    },
    links: [
      { kind: "whatsapp", url: "https://wa.me/821023274925" },
      { kind: "instagram", url: "https://www.instagram.com/daybeauglobal" },
      { kind: "price", url: "https://www.daybeauclinic07.com/eng/event.php", note: { ko: "영문", en: "English", zh: "英文", ja: "英語", th: "ภาษาอังกฤษ" } },
      { kind: "website", url: "https://www.daybeauclinic07.com/" },
    ],
  },
  {
    id: "daybeau-myeongdong",
    name: { ko: "데이뷰의원 명동 더프리미엄점", en: "Daybeau Clinic Myeongdong The Premium", zh: "Daybeau 皮肤科 明洞 The Premium 店", ja: "デイビュークリニック 明洞ザ・プレミアム店", th: "Daybeau Clinic สาขาเมียงดง The Premium" },
    area: { ko: "명동 · 남대문로 90 세미콜론 명동 6층", en: "Myeongdong · 6F Semicolon Myeongdong, 90 Namdaemun-ro", zh: "明洞 · 南大门路 90 Semicolon 明洞 6楼", ja: "明洞 · 南大門路90 セミコロン明洞6階", th: "เมียงดง · ชั้น 6 Semicolon Myeongdong, 90 Namdaemun-ro" },
    doctor: null,
    highlights: {
      ko: "명동 관광 동선에 있는 지점. 왓츠앱·라인·카카오톡으로 외국어 상담을 받습니다.",
      en: "Right in the Myeongdong shopping area. Consultations in foreign languages via WhatsApp, LINE and KakaoTalk.",
      zh: "位于明洞购物区。可通过 WhatsApp、LINE、KakaoTalk 进行外语咨询。",
      ja: "明洞の観光エリア内。WhatsApp・LINE・カカオトークで外国語相談ができます。",
      th: "อยู่ในย่านช้อปปิ้งเมียงดง ปรึกษาภาษาต่างประเทศได้ทาง WhatsApp, LINE และ KakaoTalk",
    },
    links: [
      { kind: "whatsapp", url: "https://wa.me/821064427513" },
      { kind: "line", url: "https://line.me/R/ti/p/@891oeoyt" },
      { kind: "instagram", url: "https://www.instagram.com/daybeaumd_global/", note: { ko: "글로벌", en: "Global", zh: "国际", ja: "グローバル", th: "Global" } },
      { kind: "booking", url: "https://www.daybeauclinic11.com/appointment.php" },
      { kind: "price", url: "https://www.daybeauclinic11.com/eng/event.php", note: { ko: "영문", en: "English", zh: "英文", ja: "英語", th: "ภาษาอังกฤษ" } },
      { kind: "kakao", url: "https://pf.kakao.com/_dxoxbTn" },
      { kind: "naverBooking", url: "https://m.booking.naver.com/booking/13/bizes/1329814" },
      { kind: "website", url: "https://www.daybeauclinic11.com/" },
    ],
  },
  {
    id: "ceramique-gangnam",
    name: { ko: "세라미크의원 강남점", en: "Ceramique Clinic Gangnam", zh: "Ceramique 皮肤科 江南店", ja: "セラミククリニック 江南店", th: "Ceramique Clinic สาขาคังนัม" },
    area: { ko: "강남역 · 봉은사로2길 29", en: "Gangnam Stn. · 29 Bongeunsa-ro 2-gil", zh: "江南站 · 奉恩寺路2街 29", ja: "江南駅 · 奉恩寺路2キル29", th: "สถานีคังนัม · 29 Bongeunsa-ro 2-gil" },
    doctor: { ko: "대표원장 이종진 (미용해부학 박사)", en: "Head doctor: 이종진 (Lee), PhD in aesthetic anatomy", zh: "院长：이종진（美容解剖学博士）", ja: "院長：이종진（美容解剖学博士）", th: "แพทย์หัวหน้า: 이종진 (ปริญญาเอกด้านกายวิภาคเพื่อความงาม)" },
    highlights: {
      ko: "해부학 기반 리프팅·안티에이징, 레이저 제모. 외국인 환자 비중이 높은 곳.",
      en: "Anatomy-based lifting and anti-aging, plus laser hair removal. Many international patients.",
      zh: "基于解剖学的提升与抗衰老、激光脱毛。外国患者比例高。",
      ja: "解剖学に基づくリフトアップ・アンチエイジング、レーザー脱毛。外国人患者が多いクリニック。",
      th: "ยกกระชับและต่อต้านวัยตามหลักกายวิภาค และเลเซอร์กำจัดขน มีผู้ป่วยต่างชาติจำนวนมาก",
    },
    links: [
      { kind: "booking", url: "https://gangnam.ceramiqueclinic.com/reservation" },
      { kind: "price", url: "https://gangnam.ceramiqueclinic.com/products/pricing" },
      { kind: "phone", url: "tel:+82262053430" },
      { kind: "website", url: "https://gangnam.ceramiqueclinic.com/" },
    ],
  },
];

export const partnerClinicById = (id: string | undefined) => partnerClinics.find((clinic) => clinic.id === id);
