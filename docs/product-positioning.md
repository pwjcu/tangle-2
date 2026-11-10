# Tangle Product Positioning

## Mission (2026-11)

탱글은 사람과 정보, 그리고 병원을 잇는 허브입니다.

- 후기나 광고가 아니라, 실제로 다녀온 사람의 경험과 추천을 바탕으로 정보를 짜임새 있게 정리합니다.
- 경험은 주관적이라는 점을 숨기지 않습니다. 누가, 언제, 어떤 경로로 얻은 정보인지 출처와 범위를 함께 보여 줍니다.
- 목표는 순위를 매기는 것이 아니라 환자가 스스로 선택할 수 있도록 돕는 것입니다.
- 광고비로 병원 노출이나 순위를 바꾸지 않습니다. 서비스 운영을 돕는 파트너(협찬)는 병원 정보와 분리하고, 협찬임을 항상 표시합니다.
- 다음 단계: 웹을 마무리한 뒤 앱으로 출시하고 홍보합니다.

## Core Purpose

Tangle connects consumers and clinics.

The platform should reduce the time, effort, and cost required before a real consultation happens.

It is not a review community. Reviews are increasingly unreliable in the beauty treatment market, so Tangle should focus on compact, trustworthy, structured information and bidirectional matching.

## Consumer Value

- Understand basic treatment options without becoming a heavy user first.
- Compare treatment candidates by concern, budget, recovery time, and expected fit.
- Use the free SEO Price Index (`/prices`) for Gangnam-area distribution (median, range, sample count, as-of) without hospital names — then request real quotes.
- Send a structured request instead of repeatedly explaining the same situation to clinics.
- Receive reverse proposals from clinics that believe the customer is a good fit.

## Price Index Monetization (later)

Free public index → clinic subscription for named listing/claims. Do not build subscription in MVP.

## Clinic Value

- Reduce repetitive first-touch consultation work.
- See structured patient intent before direct contact.
- Filter patients by budget, concern, preferred area, and treatment direction.
- Bring in new users who are not already high-frequency treatment experts.

## Marketplace Logic

Tangle should work more like a matching marketplace than a static information site.

Flow:

1. User learns enough basic information to make a request.
2. User submits a structured offer/request.
3. Clinics review fit and send reverse proposals.
4. If patient-clinic fit is strong, reservation and consultation move quickly.

## Global Direction

The same structure can expand to global patient acquisition.

Future layers:

- multilingual treatment summaries
- translated request forms
- clinic proposals written for foreign patients
- pre-consultation document generation
- camera/image-based pre-screening with strict privacy handling

## Access Control Direction

The hospital center is a prototype surface now.

Production goal:

- admin accounts can access management views
- approved clinic accounts can access partner proposal views
- normal consumer accounts cannot access hospital request lists
- sensitive request data should never be publicly visible

Current prototype direction:

- hide hospital center request details unless the user is logged in
- later replace this with role-based authorization in Supabase

## Kakao Channel Integration

Tangle needs a visible Kakao Channel entry point.

Implementation direction:

- expose a `카카오 채널` menu item
- connect it with `NEXT_PUBLIC_KAKAO_CHANNEL_URL`
- use it for quick inquiry, channel add, and future consultation routing

## Experience Guides

분야별로 경험을 깊게 정리한 가이드를 둡니다. 첫 가이드는 `/guide/breast`(가슴성형)입니다.

- 근거: 운영진이 2026년 11월 직접 다녀온 서울 성형외과 10곳 상담, 치과의사·간호사·성형외과 전문의·일반의 지인의 의견.
- 제품 사실(FDA 승인, 제조사 상태, 보증 조건)은 공개 자료로 확인하고 출처를 링크합니다.
- 업계 추측(공급 계약, 리베이트 등)과 특정 병원 이름을 엮은 추측은 공개 화면에 싣지 않습니다.
- 상담 경험과 수술 후기를 구분해 표기합니다.

## Partner (Sponsor)

`탱글 × 닥터에이디` — 운영진이 함께 만드는 헤어케어 브랜드를 파트너로 노출합니다.

- 설정: `lib/파트너.ts` (자사몰 주소는 `NEXT_PUBLIC_DRAIDEE_SHOP_URL`, UTM 자동 부착)
- 노출 위치: 홈 하단 섹션, 전 페이지 푸터 띠. 의료 가이드 본문 안에는 넣지 않습니다.
- 링크는 `rel="sponsored"`, 화면에는 SPONSORED 표기와 관계 고지 문구를 둡니다.
- 모델 이미지: `public/partners/draidee/`, 브랜드 폰트: `public/fonts/draidee-brand.*`
