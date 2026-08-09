# Tangle Product Positioning

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
