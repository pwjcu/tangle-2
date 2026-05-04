-- Tangle pricing evidence schema proposal
-- This file is not auto-applied. Run manually in Supabase after review.

create table if not exists public.price_sources (
  id bigint generated always as identity primary key,
  clinic_name text,
  source_name text not null,
  source_type text not null, -- public_image, website, kakao_channel, blog, manual
  source_url text,
  source_path text,
  captured_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.treatment_aliases (
  id bigint generated always as identity primary key,
  canonical_name text not null,
  alias_name text not null,
  category text,
  created_at timestamptz not null default now(),
  unique(alias_name)
);

create table if not exists public.price_evidence (
  id bigint generated always as identity primary key,
  source_id bigint references public.price_sources(id) on delete set null,
  clinic_name text,
  category text not null,
  subcategory text,
  canonical_treatment_name text,
  raw_treatment_name text not null,
  treatment_variant text,
  package_components text,
  area_scope text,
  session_count int,
  quantity_text text,
  price_krw numeric,
  price_manwon numeric,
  currency text not null default 'KRW',
  vat_included boolean,
  confidence text not null default 'medium', -- high, medium, low
  status text not null default 'pending', -- pending, reviewed, approved, rejected
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_price_evidence_category on public.price_evidence(category);
create index if not exists idx_price_evidence_treatment on public.price_evidence(canonical_treatment_name);
create index if not exists idx_price_evidence_status on public.price_evidence(status);

-- Optional future view for approved evidence only
create or replace view public.approved_price_evidence as
select *
from public.price_evidence
where status = 'approved';
