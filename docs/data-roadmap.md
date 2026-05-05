# Tangle Data Roadmap

## Current Priority

The next quality jump should come from better treatment and pricing data, not from CNN first.

Why:

- Public clinic price/event images are relatively easy to collect.
- The current `treatments` table is still useful, but it needs more evidence and broader coverage.
- The current chatbot and recommendation endpoints do **not** perform live web search.
- CNN for face analysis will need a separate, slower track with different data constraints.

## What Already Exists

- The app already uses Supabase `treatments`, `requests`, and `bids`.
- Recommendation logic is driven by treatment rows and OpenAI-generated explanation layers.
- The chat route only uses the local `treatments` table plus OpenAI text generation.

## Important Clarification

OpenAI API in the current project does **not** automatically search the web.

Current code behavior:

- `app/api/chat/route.ts`
  - reads from Supabase `treatments`
  - sends those rows into an OpenAI prompt
  - returns a text answer
- `app/api/recommend-course/route.ts`
  - scores treatment candidates from Supabase
  - optionally asks OpenAI to rewrite the result more clearly

So if we want:

- latest pricing
- newly added treatment types
- public reviews
- public clinic event posts

we need our own collection and validation flow.

## Recommended Data Stack

### 1. Treatment Master

Keep one normalized treatment catalog.

Needed fields:

- canonical treatment name
- category
- aliases / spelling variants
- baseline description
- typical downtime
- side effects
- synergy
- recommended_for
- evidence status

### 2. Price Evidence

Store raw public price evidence separately from the treatment master.

Examples:

- image/post based event price
- website price table
- Kakao channel notice
- blog or landing event post

Why separate it:

- public promo prices are volatile
- package prices should not overwrite base treatment ranges blindly
- one treatment can have many competing price snapshots

### 3. Review / Outcome Signals

Do not start with raw full-text review ingestion first.

Instead, collect structured summaries like:

- pain perception
- downtime perception
- satisfaction
- “felt overpriced”
- “natural result”
- “needed repeated sessions”

### 4. CNN / Image Analysis Track

Treat this as a separate experimental layer.

Use cases:

- skin concern pre-screening
- redness / pores / acne-trace / tone irregularity support signal

Do **not** promise:

- medically valid diagnosis
- exact aesthetic post-procedure face prediction

## New Catalog Expansion Requested

Add under `관리` or adjacent care-support scope:

- 수액류
- 크라이오
- 고압산소치료

These fit better as:

- recovery support
- anti-aging support
- adjunct care

than as the main recommendation engine’s primary high-impact facial procedure.

## Latest Evidence Batch

Added from user-provided clinic price photos on `2026-05-04`:

- Serrea Clinic care/support pricing: 고압산소치료, 줄기세포 혈청 부스터, 항노화 프로그램
- IV and recovery care: 마늘주사, 백옥/글루타치온, NAD/NMN, 싸이모신알파
- lifting and contouring evidence: 온다, 티타늄, 울쎄라피 프라임, 써마지 FLX
- pore/scar and booster packages: 포텐자, 엑소좀, 리쥬란S, 리쥬란 HB

Current local evidence file summary:

- 15 price source images/posts
- 125 treatment or package rows
- categories covered: 관리, 스킨부스터, 리프팅, 필러, 보톡스, 모공흉터, 색소

## Search-Assisted Expansion Batch

Added on `2026-05-05` as local review candidates and revised after market fit review:

- 색소/레이저: 피코토닝, 혈관레이저
- 모공흉터: 프락셔널 CO2 레이저, 마이크로니들링, RF 마이크로니들링
- 스킨부스터: 리투오 ECM 스킨부스터
- 리프팅: 세르프, 볼뉴머, 덴서티, 리프테라2
- 바디라인: 비침습 바디컨투어링

Removed from candidates after user market review:

- IPL 광치료
- 화학박피

These were not pushed directly into the live Supabase table. They were saved as reviewable seed/candidate files first to avoid duplicate or unsafe production data.

## User CSV Expansion Batch

Added on `2026-05-05` from `korea_skin_procedures_2026_final.csv`:

- 32 deduplicated rows were retained as Tangle treatment candidates.
- Duplicate generic rows such as 보톡스, 필러, 리쥬란, 쥬베룩, 울쎄라, 써마지, 인모드, 포텐자, 슈링크 유니버스, 볼뉴머 were excluded.
- IPL stayed excluded based on market-fit feedback.
- 브이빔 / 브이빔 퍼펙타 / 엑셀V were treated as 혈관레이저 aliases rather than separate master rows.

Files:

- `data/korea-skin-procedures-2026-reviewed.json`
- `supabase/korea_skin_procedures_2026_seed.sql`

## Immediate Next Build Steps

### Step 1. Evidence-first pricing pipeline

- Keep collecting public price images
- Convert them into structured rows
- Review manually
- Merge into treatment-level price ranges carefully

### Step 2. Add missing treatment families

- 수액류
- 크라이오
- 고압산소치료
- newer skinbooster / ECM / PN / collagen variants
- event package structures

### Step 3. Upgrade trust logic

Recommendation should eventually consider:

- base treatment fit
- public price evidence count
- recency
- package vs single-treatment distinction
- review signal summaries

### Step 4. Build OCR-assisted admin flow

Future admin flow:

1. upload image
2. OCR extract
3. manual correction
4. map to canonical treatment
5. store as price evidence

## Files Added For This Track

- `data/price-import-template.csv`
- `data/price-evidence-samples.json`
- `data/treatment-catalog-expansion.json`
- `data/treatment-search-expansion-2026-05.json`
- `data/korea-skin-procedures-2026-reviewed.json`
- `supabase/price_data_schema.sql`
- `supabase/treatment_expansion_seed.sql`
- `supabase/korea_skin_procedures_2026_seed.sql`

These are scaffolding files for the next phase.
