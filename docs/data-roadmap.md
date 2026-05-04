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

These are scaffolding files for the next phase.
