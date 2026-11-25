import { boundedText } from "./견적권한";
import type { CriterionId } from "./검증병원";

/** 원장님이 스스로 확인하고 체크하는 항목. 모두 체크해야 신청할 수 있습니다. */
export const declarationItems: { id: CriterionId; text: string; surgeryOnly?: boolean }[] = [
  { id: "license", text: "대한민국 의사면허가 유효하고, 표시한 전문의 자격이 사실입니다." },
  { id: "education", text: "정상 절차로 의대에 입학·졸업했고, 입시비리로 입학·학위가 취소·처분된 적이 없습니다." },
  { id: "criminal", text: "형사처벌 받은 범죄 경력이 없으며, 범죄경력회보서를 직접 발급해 제출할 수 있습니다." },
  { id: "malpractice", text: "의료사고로 형사처벌·면허정지를 받은 적이 없고, 진행 중인 분쟁은 아래에 숨김없이 적었습니다." },
  { id: "sanction", text: "대리수술·불법 광고·면허 정지 등 행정처분 이력이 없습니다." },
  { id: "cctv", text: "수술실에 CCTV를 설치·운영하며, 환자가 요청하면 촬영합니다.", surgeryOnly: true },
  { id: "direct", text: "상담한 원장이 직접 진료하며, 대리수술을 하지 않습니다." },
];

export const requiredDocuments = [
  "의사면허증·전문의 자격증 사본",
  "의대 졸업증명서(또는 학위증명서)",
  "범죄경력회보서 (원장님 본인 발급)",
  "의료기관 개설신고증 사본",
  "수술실 CCTV 설치 사진·운영 안내문 (수술하는 경우)",
  "의료사고·분쟁 자기신고서 (탱글 양식)",
];

export const consentText =
  "수집 항목: 병원명, 원장 이름, 전문과목, 주소, 담당자 이름·연락처, 자기신고 내용. 목적: 검증 심사와 연락. 보유 기간: 심사 종료 후 1년. 동의하지 않을 수 있으나, 이 경우 신청할 수 없습니다.";

export type Application = {
  clinic: string; doctor: string; specialty: string; address: string;
  contact_name: string; contact_phone: string; contact_email: string | null; website: string | null;
  performs_surgery: boolean; declarations: Record<string, boolean>; disclosure: string | null; consent: true;
};

/** 입력을 검사해 저장할 신청서를 만들거나, 문제를 설명하는 문장을 돌려줍니다. */
export function parseApplication(body: Record<string, unknown>): Application | string {
  const clinic = boundedText(body.clinic, 80, 2);
  const doctor = boundedText(body.doctor, 40, 2);
  const specialty = boundedText(body.specialty, 60, 2);
  const address = boundedText(body.address, 160, 5);
  const contactName = boundedText(body.contact_name, 40, 2);
  const phone = boundedText(body.contact_phone, 20, 8);
  if (!clinic || !doctor || !specialty || !address || !contactName || !phone) return "병원명, 원장 이름, 전문과목, 주소, 담당자 이름과 연락처를 확인해 주세요.";
  if (!/^[0-9+\-() ]{8,20}$/.test(phone)) return "연락처는 숫자와 - 만 입력해 주세요.";
  const email = typeof body.contact_email === "string" && body.contact_email.trim() ? body.contact_email.trim() : null;
  if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return "이메일 주소를 확인해 주세요.";
  const website = typeof body.website === "string" && body.website.trim() ? body.website.trim() : null;
  if (website && (website.length > 300 || !/^https?:\/\//i.test(website))) return "홈페이지 주소는 https:// 로 시작해야 해요.";
  if (typeof body.performs_surgery !== "boolean") return "수술 여부를 선택해 주세요.";
  const raw = body.declarations && typeof body.declarations === "object" ? body.declarations as Record<string, unknown> : {};
  const needed = declarationItems.filter((item) => !item.surgeryOnly || body.performs_surgery);
  if (!needed.every((item) => raw[item.id] === true)) return "모든 확인 항목에 체크해야 신청할 수 있어요.";
  if (body.consent !== true) return "개인정보 수집·이용에 동의해 주세요.";
  const disclosure = typeof body.disclosure === "string" && body.disclosure.trim() ? body.disclosure.trim().slice(0, 1000) : null;
  return {
    clinic, doctor, specialty, address, contact_name: contactName, contact_phone: phone, contact_email: email, website,
    performs_surgery: body.performs_surgery, declarations: Object.fromEntries(needed.map((item) => [item.id, true])), disclosure, consent: true,
  };
}

/** DB 연결 전에도 원장님이 카카오 채널로 보낼 수 있게 신청 내용을 글로 만듭니다. */
export function applicationText(application: Application) {
  return [
    "[탱글 검증 병원 신청]",
    `병원: ${application.clinic}`,
    `원장: ${application.doctor} (${application.specialty})`,
    `주소: ${application.address}`,
    `담당자: ${application.contact_name} / ${application.contact_phone}${application.contact_email ? ` / ${application.contact_email}` : ""}`,
    application.website ? `홈페이지: ${application.website}` : "",
    `수술 여부: ${application.performs_surgery ? "수술함" : "수술 안 함"}`,
    "자기신고: 모든 항목 확인",
    application.disclosure ? `분쟁·참고사항: ${application.disclosure}` : "",
  ].filter(Boolean).join("\n");
}
