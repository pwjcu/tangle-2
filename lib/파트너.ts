/**
 * 탱글 파트너(협찬) 브랜드 설정.
 * 자사몰 주소는 NEXT_PUBLIC_DRAIDEE_SHOP_URL 환경변수로 덮어쓸 수 있습니다.
 * 주소가 비어 있으면 구매 버튼은 숨기고 소개만 보여 줍니다.
 */
export const drAideePartner = {
  name: "닥터에이디",
  nameEn: "Dr. Aidee",
  line: "헤어올로지",
  tagline: "두피와 모발을 위한 프리미엄 헤어케어",
  shopUrl: process.env.NEXT_PUBLIC_DRAIDEE_SHOP_URL ?? "",
  label: "SPONSORED",
  product: "Vegan Shampoo for Hair Regrowth & Scalp Therapy",
  models: [
    { src: "/partners/draidee/model-01.webp", width: 900, height: 1125, alt: "닥터에이디 비건 샴푸를 들고 있는 흰 민소매 차림의 모델" },
    { src: "/partners/draidee/model-02.webp", width: 900, height: 1200, alt: "닥터에이디 비건 샴푸를 얼굴 옆에 든 검은 니트 차림의 모델" },
    { src: "/partners/draidee/model-03.webp", width: 900, height: 1200, alt: "닥터에이디 비건 샴푸를 든 흰 셔츠 차림의 남성 모델" },
  ],
  /** 신뢰가 핵심인 서비스라 관계를 숨기지 않습니다. 문구는 여기서만 고치면 전체에 반영됩니다. */
  disclosure: "닥터에이디는 탱글 운영진이 함께 만드는 파트너 브랜드입니다. 병원·의료진 정보와 추천 내용에는 관여하지 않습니다.",
};

export function partnerShopHref(utmContent: string): string | null {
  if (!drAideePartner.shopUrl) return null;
  try {
    const url = new URL(drAideePartner.shopUrl);
    url.searchParams.set("utm_source", "tangle");
    url.searchParams.set("utm_medium", "partner");
    url.searchParams.set("utm_campaign", "tangle_x_draidee");
    url.searchParams.set("utm_content", utmContent);
    return url.href;
  } catch {
    return null;
  }
}
