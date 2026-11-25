/**
 * 탱글 검증 병원.
 * 원장님이 직접 신청하고 서류를 내면, 탱글이 아래 기준을 하나씩 확인해 통과한 곳만 올립니다.
 * 국적·출신·혈통은 기준이 아닙니다. 자격과 이력만 봅니다.
 */
import source from "../data/검증병원.json";

export type CriterionId = "license" | "education" | "criminal" | "malpractice" | "sanction" | "cctv" | "direct" | "noad";

export type VerificationCriterion = {
  id: CriterionId;
  title: string;
  detail: string;
  /** 원장님이 내야 하는 서류 또는 탱글이 확인하는 방법 */
  proof: string;
};

export const verificationCriteria: VerificationCriterion[] = [
  { id: "license", title: "국내 의사면허·전문의 자격", detail: "대한민국 의사면허가 유효하고, 표시한 전문의 자격이 실제와 같아요.", proof: "의사면허증·전문의 자격증 사본" },
  { id: "education", title: "정상적인 의대 입학·졸업", detail: "정상 절차로 의대에 입학·졸업했고, 입시비리로 입학이나 학위가 취소·처분된 이력이 없어요.", proof: "의대 졸업증명서·학위증명서" },
  { id: "criminal", title: "범죄 경력 없음", detail: "형사처벌 받은 범죄 경력이 없어요.", proof: "원장님 본인이 발급한 범죄경력회보서" },
  { id: "malpractice", title: "의료사고·분쟁 이력 확인", detail: "의료사고로 형사처벌을 받거나 면허가 정지된 이력이 없어요. 조정 중인 분쟁은 숨기지 않고 신고해요.", proof: "의료사고·분쟁 자기신고서 + 공개 판결 확인" },
  { id: "sanction", title: "행정처분 없음", detail: "대리수술·불법 광고·면허 정지 같은 행정처분 이력이 없어요.", proof: "보건복지부 행정처분 공개 자료 확인" },
  { id: "cctv", title: "수술실 CCTV 운영", detail: "수술실에 CCTV를 설치·운영하고, 환자가 요청하면 촬영해요. 수술을 하지 않는 의원은 '해당 없음'으로 표시해요.", proof: "수술실 CCTV 설치 사진·운영 안내문" },
  { id: "direct", title: "상담한 원장님이 직접 진료", detail: "상담한 원장님이 직접 수술·시술해요. 대리수술은 없어요.", proof: "진료 운영 서약서" },
  { id: "noad", title: "돈으로 사지 않는 자리", detail: "검증은 무료예요. 광고비로 순서를 바꾸거나 검증을 살 수 없어요.", proof: "탱글 운영 원칙" },
];

export type VerifiedClinic = {
  id: string;
  clinic: string;
  doctor: string;
  specialty: string;
  region: string;
  address: string;
  /** 마지막으로 서류를 확인한 날 (YYYY-MM-DD). 1년마다 다시 확인합니다. */
  verifiedAt: string;
  /** 기준별 결과. 수술을 하지 않는 곳의 CCTV는 "na" */
  checks: Record<CriterionId, "pass" | "na">;
  intro: string;
  links: { kind: "website" | "booking" | "kakao" | "instagram" | "phone"; url: string }[];
};

export const verifiedClinics = source.clinics as VerifiedClinic[];

/** 확인일로부터 1년이 지나면 재검증이 필요합니다. */
export function needsReverification(clinic: VerifiedClinic, today = new Date()) {
  const checked = new Date(`${clinic.verifiedAt}T00:00:00+09:00`);
  return today.getTime() - checked.getTime() > 365 * 24 * 60 * 60 * 1000;
}

export const verificationSteps = [
  { title: "신청", detail: "원장님이 병원 정보와 자기신고 항목을 적어 신청해요." },
  { title: "서류 확인", detail: "탱글이 연락드려 서류를 받고, 공개 자료와 하나씩 대조해요." },
  { title: "게시", detail: "모든 기준을 통과한 곳만 검증 병원에 올려요." },
  { title: "1년마다 재확인", detail: "매년 다시 확인하고, 허위가 드러나면 바로 내려요." },
] as const;
