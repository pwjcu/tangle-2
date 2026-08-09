-- ============================================================================
-- Tangle Price Index MVP — 통합 마이그레이션 + 시드
-- 생성: node scripts/generate-price-index-sql.mjs (2026-08-09)
-- 원본: data/price-evidence-samples.json (소스 15건, 근거 125건)
--
-- 실행 방법: Supabase Dashboard → SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
-- 프로젝트: hqqzhhqvlelonkaesbkq
-- 멱등 설계: 여러 번 실행해도 시드는 cnn-* 소스 기준으로 지우고 다시 넣습니다.
--
-- 공개 범위 (중요):
--   anon/authenticated 가 읽을 수 있는 것:
--     price_index, price_index_evidence, v_price_index_public (집계·비식별 스냅샷)
--   읽을 수 없는 것: price_evidence, price_sources, treatment_aliases (병원명·원본 경로 포함)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 증거 스키마 (price_data_schema.sql 과 호환, 없으면 생성 / 있으면 컬럼 보강)
-- ----------------------------------------------------------------------------
create table if not exists public.price_sources (
  id bigint generated always as identity primary key,
  clinic_name text,
  source_name text,
  source_type text not null,
  source_url text,
  source_path text,
  captured_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.price_sources add column if not exists source_key text;
alter table public.price_sources add column if not exists source_path text;
create unique index if not exists price_sources_source_key_key on public.price_sources(source_key);

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
  confidence text not null default 'medium',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.price_evidence add column if not exists region text;
alter table public.price_evidence add column if not exists evidence_kind text not null default 'regular';
alter table public.price_evidence add column if not exists unit_price_manwon numeric;

create index if not exists idx_price_evidence_category on public.price_evidence(category);
create index if not exists idx_price_evidence_treatment on public.price_evidence(canonical_treatment_name);
create index if not exists idx_price_evidence_status on public.price_evidence(status);
create index if not exists idx_price_evidence_region on public.price_evidence(region);

-- ----------------------------------------------------------------------------
-- 2. 공개용 테이블 (병원명 없음 — 집계 + 비식별 근거 스냅샷)
-- ----------------------------------------------------------------------------
create table if not exists public.price_index (
  id bigint generated always as identity primary key,
  canonical_treatment_name text not null,
  category text,
  region text not null default '강남권',
  evidence_count int not null default 0,
  min_price numeric,
  p25_price numeric,
  median_price numeric,
  p75_price numeric,
  max_price numeric,
  last_evidence_at date,
  confidence_grade text not null default 'low',
  refreshed_at timestamptz not null default now(),
  unique(canonical_treatment_name, region)
);

create table if not exists public.price_index_evidence (
  id bigint generated always as identity primary key,
  canonical_treatment_name text not null,
  category text,
  region text,
  evidence_kind text not null default 'regular',
  variant_text text,
  package_components text,
  session_count int,
  price_manwon numeric not null,
  unit_price_manwon numeric,
  confidence text,
  captured_date date,
  source_type text,
  refreshed_at timestamptz not null default now()
);

-- 공개 집계 뷰 (anon-safe: 병원명·원본 경로 없음)
create or replace view public.v_price_index_public as
select
  canonical_treatment_name,
  category,
  region,
  evidence_count,
  min_price,
  p25_price,
  median_price,
  p75_price,
  max_price,
  last_evidence_at,
  confidence_grade,
  refreshed_at
from public.price_index;

-- ----------------------------------------------------------------------------
-- 3. RLS — 원본 증거는 비공개, 집계/스냅샷만 공개
-- ----------------------------------------------------------------------------
alter table public.price_sources enable row level security;
alter table public.treatment_aliases enable row level security;
alter table public.price_evidence enable row level security;
-- (정책을 만들지 않으므로 anon/authenticated 의 원본 조회는 차단됩니다)

alter table public.price_index enable row level security;
drop policy if exists price_index_public_read on public.price_index;
create policy price_index_public_read on public.price_index for select using (true);

alter table public.price_index_evidence enable row level security;
drop policy if exists price_index_evidence_public_read on public.price_index_evidence;
create policy price_index_evidence_public_read on public.price_index_evidence for select using (true);

grant select on public.price_index to anon, authenticated;
grant select on public.price_index_evidence to anon, authenticated;
grant select on public.v_price_index_public to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. 시드 — 소스 15건
-- ----------------------------------------------------------------------------
insert into public.price_sources (source_key, clinic_name, source_type, source_path, captured_date)
values
  ('cnn-001', '나의계절의원', 'public_image', '20260320_095117_326.jpg', '2026-03-20'),
  ('cnn-002', '네스트의원', 'public_screenshot', '스크린샷 2026-05-04 153035.png', '2026-05-04'),
  ('cnn-003', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153043.png', '2026-05-04'),
  ('cnn-004', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153156.png', '2026-05-04'),
  ('cnn-005', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153203.png', '2026-05-04'),
  ('cnn-006', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153213.png', '2026-05-04'),
  ('cnn-007', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153221.png', '2026-05-04'),
  ('cnn-008', '엘라비에', 'public_screenshot', '스크린샷 2026-05-04 153227.png', '2026-05-04'),
  ('cnn-009', '미상', 'public_screenshot', '스크린샷 2026-05-04 153234.png', '2026-05-04'),
  ('cnn-010', '미상', 'public_screenshot', '스크린샷 2026-05-04 153251.png', '2026-05-04'),
  ('cnn-011', '미상', 'public_screenshot', '스크린샷 2026-05-04 153304.png', '2026-05-04'),
  ('cnn-012', '세리아의원', 'clinic_price_photo', 'KakaoTalk_20260504_160856950.jpg', '2026-05-04'),
  ('cnn-013', '세리아의원', 'clinic_price_photo', 'KakaoTalk_20260504_160856950_01.jpg', '2026-05-04'),
  ('cnn-014', '세리아의원', 'clinic_price_photo', 'KakaoTalk_20260504_160856950_02.jpg', '2026-05-04'),
  ('cnn-015', '세리아의원', 'clinic_price_photo', 'KakaoTalk_20260504_160856950_03.jpg', '2026-05-04')
on conflict (source_key) do nothing;

-- 같은 배치 재실행을 위해 기존 cnn-* 근거를 지우고 다시 넣습니다.
delete from public.price_evidence
where source_id in (select id from public.price_sources where source_key like 'cnn-%');

insert into public.price_evidence (
  source_id, category, subcategory, canonical_treatment_name, raw_treatment_name,
  treatment_variant, package_components, area_scope, session_count, quantity_text,
  price_krw, price_manwon, confidence, status, region, evidence_kind, unit_price_manwon, notes
)
values
  ((select id from public.price_sources where source_key = 'cnn-001'), '필러', '동안 풀페이스 필러', '국산 아띠에르', '국산 아띠에르', '6cc', null, null, 1, '6cc', 780000, 78, 'high', 'approved', '강남권', 'regular', 78, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '필러', '동안 풀페이스 필러', '독일 아말리안', '독일 아말리안', '6cc', null, null, 1, '6cc', 1670000, 167, 'high', 'approved', '강남권', 'regular', 167, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '필러', '동안 풀페이스 필러', '프랑스 쥬비덤', '프랑스 쥬비덤', '6cc', null, null, 1, '6cc', 2280000, 228, 'high', 'approved', '강남권', 'regular', 228, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '스킨부스터', '콜라겐 동안 볼륨', '쥬베룩볼륨', '쥬베룩볼륨', '3병 (풀페이스)', null, null, 1, '3병 (풀페이스)', 1750000, 175, 'high', 'approved', '강남권', 'regular', 175, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '스킨부스터', '콜라겐 동안 볼륨', '쥬베룩볼륨', '쥬베룩볼륨', '3회 (한부위)', null, null, 3, '3회 (한부위)', 900000, 90, 'high', 'approved', '강남권', 'regular', 30, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '스킨부스터', '콜라겐 동안 볼륨', '스킨바이브', '스킨바이브', '3cc', null, null, 1, '3cc', 1000000, 100, 'high', 'approved', '강남권', 'regular', 100, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '리프팅', '프리미엄 리프팅', '울쎄라', '울쎄라', '400샷', null, null, 1, '400샷', 1400000, 140, 'high', 'approved', '강남권', 'regular', 140, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '리프팅', '프리미엄 리프팅', '올리지오', '올리지오', '600샷', null, null, 1, '600샷', 920000, 92, 'high', 'approved', '강남권', 'regular', 92, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '리프팅', '프리미엄 리프팅', '올리지오', '올리지오', '900샷', null, null, 1, '900샷', 1370000, 137, 'medium', 'approved', '강남권', 'regular', 137, 'Image included additional small tag text that was not fully legible.'),
  ((select id from public.price_sources where source_key = 'cnn-001'), '리프팅', '프리미엄 리프팅', '슈링크', '슈링크', '600샷 3회', null, null, 3, '600샷 3회', 1090000, 109, 'high', 'approved', '강남권', 'regular', 36.3, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '리프팅', '프리미엄 리프팅', '슈링크', '슈링크', '400샷 3회', null, null, 3, '400샷 3회', 820000, 82, 'high', 'approved', '강남권', 'regular', 27.3, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '항노화, 부스터 주사', '쥬베룩', '쥬베룩', '3회', null, null, 3, '3회', 840000, 84, 'high', 'approved', '강남권', 'regular', 28, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '항노화, 부스터 주사', '리쥬란 HB', '리쥬란 HB', '2cc 3회', 'sv 스킨보톡스', null, 3, '2cc 3회', 1300000, 130, 'high', 'approved', '강남권', 'package', 43.3, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '항노화, 부스터 주사', '시크릿', '시크릿', '6회', 'sv 베네브앰플', null, 6, '6회', 1600000, 160, 'medium', 'approved', '강남권', 'package', 26.7, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '부작용케어', '초음파 히알라제', '초음파 히알라제', '필러 녹이는 주사', null, null, 1, '필러 녹이는 주사', 300000, 30, 'medium', 'approved', '강남권', 'regular', 30, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '부작용케어', '콜라겐 결절 제거', '콜라겐 결절 제거', null, null, null, 1, null, 350000, 35, 'high', 'approved', '강남권', 'regular', 35, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '피부관리', '아쿠아필', '아쿠아필', '5회', 'sv 코나비존 압출', null, 5, '5회', 320000, 32, 'medium', 'approved', '강남권', 'package', 6.4, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '피부관리', '플라필', '플라필', '5회', null, null, 5, '5회', 550000, 55, 'high', 'approved', '강남권', 'regular', 11, null),
  ((select id from public.price_sources where source_key = 'cnn-001'), '관리', '피부관리', '원데이 여드름 패키지', '원데이 여드름 패키지', '3회', null, null, 3, '3회', 690000, 69, 'high', 'approved', '강남권', 'regular', 23, null),
  ((select id from public.price_sources where source_key = 'cnn-002'), '리프팅', '4월 이벤트', '울쎄라피프라임 + 지방분해주사 + 리쥬란힐러', '울쎄라피프라임 + 지방분해주사 + 리쥬란힐러', '600샷 + 12cc + 6cc', null, null, 1, '600샷 + 12cc + 6cc', 2990000, 299, 'high', 'approved', '강남권', 'package', 299, null),
  ((select id from public.price_sources where source_key = 'cnn-002'), '리프팅', '4월 이벤트', '아이써마지FLX + 리쥬란 아이', '아이써마지FLX + 리쥬란 아이', '450샷 + 1cc', null, null, 1, '450샷 + 1cc', 1890000, 189, 'high', 'approved', '강남권', 'package', 189, null),
  ((select id from public.price_sources where source_key = 'cnn-002'), '필러', '4월 이벤트', '리쥬비엘 어깨필러 + 국산 승모근 보톡스', '리쥬비엘 어깨필러 + 국산 승모근 보톡스', '20cc + 200유닛', null, null, 1, '20cc + 200유닛', 2400000, 240, 'high', 'approved', '강남권', 'package', 240, null),
  ((select id from public.price_sources where source_key = 'cnn-002'), '관리', '4월 이벤트', '듀얼토닝', '듀얼토닝', '5회', null, null, 5, '5회', 350000, 35, 'high', 'approved', '강남권', 'event', 7, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '스킨부스터', '리투오 런칭', '리투오', '리투오', '1병 전체 (얼굴전체)', null, null, 1, '1병 전체 (얼굴전체)', 590000, 59, 'high', 'approved', '강남권', 'event', 59, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '스킨부스터', '런칭 패키지', '리투오 + 히알톡스', '리투오 + 히알톡스', '1병 전체 + 3cc', null, null, 1, '1병 전체 + 3cc', 750000, 75, 'high', 'approved', '강남권', 'package', 75, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '스킨부스터', '런칭 프리미엄 패키지', '리투오 + 벨로테로 리바이브 + 히알톡스', '리투오 + 벨로테로 리바이브 + 히알톡스', '1병 전체 + 1cc + 3cc', null, null, 1, '1병 전체 + 1cc + 3cc', 1100000, 110, 'medium', 'approved', '강남권', 'package', 110, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '보톡스', '추가 혜택', '히알톡스 보톡스 코어톡스 변경', '히알톡스 보톡스 코어톡스 변경', null, null, null, 1, null, 100000, 10, 'high', 'approved', '강남권', 'addon', 10, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '보톡스', '추가 혜택', '히알톡스 보톡스 제오민 변경', '히알톡스 보톡스 제오민 변경', null, null, null, 1, null, 200000, 20, 'high', 'approved', '강남권', 'addon', 20, null),
  ((select id from public.price_sources where source_key = 'cnn-003'), '스킨부스터', '추가 혜택', '벨로테로 리바이브', '벨로테로 리바이브', '1cc 1병 전체 추가', null, null, 1, '1cc 1병 전체 추가', 380000, 38, 'high', 'approved', '강남권', 'addon', 38, null),
  ((select id from public.price_sources where source_key = 'cnn-004'), '리프팅', '튠페이스 레드', '튠페이스 레드', '튠페이스 레드', '30kJ', null, '눈가/중안부/하안부 중 택1', 1, '30kJ', 290000, 29, 'high', 'approved', '강남권', 'regular', 29, null),
  ((select id from public.price_sources where source_key = 'cnn-004'), '리프팅', '튠페이스 레드', '튠페이스 레드', '튠페이스 레드', '50kJ', null, '양볼', 1, '50kJ', 460000, 46, 'high', 'approved', '강남권', 'regular', 46, null),
  ((select id from public.price_sources where source_key = 'cnn-004'), '리프팅', '튠페이스 레드', '튠페이스 레드', '튠페이스 레드', '70kJ', null, '얼굴전체', 1, '70kJ', 600000, 60, 'high', 'approved', '강남권', 'regular', 60, null),
  ((select id from public.price_sources where source_key = 'cnn-004'), '리프팅', '튠페이스 레드 패키지', '튠페이스 레드 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '튠페이스 레드 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '50kJ 패키지', null, null, 1, '50kJ 패키지', 600000, 60, 'high', 'approved', '강남권', 'package', 60, null),
  ((select id from public.price_sources where source_key = 'cnn-004'), '리프팅', '튠페이스 레드 패키지', '튠페이스 레드 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '튠페이스 레드 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '70kJ 패키지', null, null, 1, '70kJ 패키지', 730000, 73, 'high', 'approved', '강남권', 'package', 73, null),
  ((select id from public.price_sources where source_key = 'cnn-005'), '리프팅', '올리지오', '올리지오', '올리지오', '630샷', null, '얼굴전체', 1, '630샷', 600000, 60, 'high', 'approved', '강남권', 'regular', 60, null),
  ((select id from public.price_sources where source_key = 'cnn-005'), '리프팅', '올리지오 패키지', '올리지오 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '올리지오 + 소노스타일러 초음파 관리 + 티파니 세라믹 도자 고주파 관리', '630샷 패키지', null, null, 1, '630샷 패키지', 730000, 73, 'high', 'approved', '강남권', 'package', 73, null),
  ((select id from public.price_sources where source_key = 'cnn-006'), '리프팅', '원데이 노블레스 베이직 패키지', '소프웨이브 + 레비나스 + 소노스타일러 초음파 관리 + 맞춤형 모델링팩', '소프웨이브 + 레비나스 + 소노스타일러 초음파 관리 + 맞춤형 모델링팩', '100샷 + 3000샷 패키지', null, null, 1, '100샷 + 3000샷 패키지', 1300000, 130, 'high', 'approved', '강남권', 'package', 130, null),
  ((select id from public.price_sources where source_key = 'cnn-006'), '리프팅', '추가 혜택', '소프웨이브 추가', '소프웨이브 추가', '50샷', null, null, 1, '50샷', 500000, 50, 'high', 'approved', '강남권', 'addon', 50, null),
  ((select id from public.price_sources where source_key = 'cnn-006'), '리프팅', '추가 혜택', '레비나스 추가', '레비나스 추가', '1500샷', null, null, 1, '1500샷', 100000, 10, 'high', 'approved', '강남권', 'addon', 10, null),
  ((select id from public.price_sources where source_key = 'cnn-007'), '관리', '이중턱 고민 해결', '이중턱 지방파괴 DCA 주사', '이중턱 지방파괴 DCA 주사', '2cc 1병 전체', null, null, 1, '2cc 1병 전체', 230000, 23, 'high', 'approved', '강남권', 'regular', 23, null),
  ((select id from public.price_sources where source_key = 'cnn-007'), '리프팅', '이중턱 고민 해결', '튠라이너', '튠라이너', '1회', null, '이중턱 / 턱라인 중 택1', 1, '1회', 140000, 14, 'high', 'approved', '강남권', 'regular', 14, null),
  ((select id from public.price_sources where source_key = 'cnn-007'), '리프팅', '이중턱 고민 해결', '튠라이너', '튠라이너', '3회', null, '이중턱 / 턱라인 중 택1', 3, '3회', 360000, 36, 'high', 'approved', '강남권', 'regular', 12, null),
  ((select id from public.price_sources where source_key = 'cnn-007'), '관리', '이중턱 고민 해결 패키지', 'DCA 주사 + 튠라이너', 'DCA 주사 + 튠라이너', '2cc 1병 + 1회', null, null, 1, '2cc 1병 + 1회', 330000, 33, 'high', 'approved', '강남권', 'package', 33, null),
  ((select id from public.price_sources where source_key = 'cnn-007'), '관리', '이중턱 고민 해결 플러스 패키지', 'DCA 주사 + 튠라이너', 'DCA 주사 + 튠라이너', '4cc 2병 + 1회', null, null, 1, '4cc 2병 + 1회', 530000, 53, 'high', 'approved', '강남권', 'package', 53, null),
  ((select id from public.price_sources where source_key = 'cnn-008'), '관리', '미백 톤업 패키지', '이래비티 레이저 브라이트닝 + 미백 관리', '이래비티 레이저 브라이트닝 + 미백 관리', '1회', null, null, 1, '1회', 170000, 17, 'high', 'approved', '강남권', 'package', 17, null),
  ((select id from public.price_sources where source_key = 'cnn-008'), '관리', '미백 톤업 패키지', '이래비티 레이저 브라이트닝 + 미백 관리', '이래비티 레이저 브라이트닝 + 미백 관리', '3회', null, null, 3, '3회', 480000, 48, 'high', 'approved', '강남권', 'package', 16, null),
  ((select id from public.price_sources where source_key = 'cnn-008'), '관리', '미백 톤업 패키지', '이래비티 레이저 브라이트닝 + 미백 관리', '이래비티 레이저 브라이트닝 + 미백 관리', '5회', null, null, 5, '5회', 750000, 75, 'high', 'approved', '강남권', 'package', 15, null),
  ((select id from public.price_sources where source_key = 'cnn-008'), '관리', '추가 혜택', '위코우노 추가', '위코우노 추가', '1회', null, null, 1, '1회', 200000, 20, 'medium', 'approved', '강남권', 'addon', 20, null),
  ((select id from public.price_sources where source_key = 'cnn-008'), '관리', '추가 혜택', '위코우노 추가', '위코우노 추가', '3회', null, null, 3, '3회', 570000, 57, 'medium', 'approved', '강남권', 'addon', 19, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '리프팅', '울쎄라피 프라임 & 울타이트', '울쎄라피 프라임', '울쎄라피 프라임', '100샷', null, null, 1, '100샷', 300000, 30, 'high', 'approved', '강남권', 'regular', 30, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '리프팅', '울쎄라피 프라임 & 울타이트', '울타이트', '울타이트', '100샷', null, null, 1, '100샷', 155000, 15.5, 'high', 'approved', '강남권', 'regular', 15.5, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '스킨부스터', '울쎄라피 프라임 & 울타이트', '힐로웨이브', '힐로웨이브', '1Box', null, null, 1, '1Box', 255000, 25.5, 'high', 'approved', '강남권', 'regular', 25.5, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '스킨부스터', '순수 콜라겐 ECM 아띠에', '아띠에 + 물광주사', '아띠에 + 물광주사', null, null, null, 1, null, 355000, 35.5, 'high', 'approved', '강남권', 'package', 35.5, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '스킨부스터', '순수 콜라겐 ECM 아띠에', '리투오 + 물광주사', '리투오 + 물광주사', null, null, null, 1, null, 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '스킨부스터', '순수 콜라겐 ECM 아띠에', '셀르디엠 + 물광주사', '셀르디엠 + 물광주사', null, null, null, 1, null, 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-009'), '스킨부스터', '순수 콜라겐 ECM 아띠에', '쥬브아셀 8% + 물광주사', '쥬브아셀 8% + 물광주사', null, null, null, 1, null, 355000, 35.5, 'high', 'approved', '강남권', 'package', 35.5, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '촉촉하고 차오르는 스킨부스터', '힐로웨이브', '힐로웨이브', '1box', null, null, 1, '1box', 280000, 28, 'high', 'approved', '강남권', 'regular', 28, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '촉촉하고 차오르는 스킨부스터', '힐로웨이브 + 릴리이드', '힐로웨이브 + 릴리이드', '1box + 3cc', null, null, 1, '1box + 3cc', 350000, 35, 'high', 'approved', '강남권', 'package', 35, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '촉촉하고 차오르는 스킨부스터', '후메딕스 리틀부스터 EX or PN + LDM', '후메딕스 리틀부스터 EX or PN + LDM', '30000', null, null, 1, '30000', 250000, 25, 'medium', 'approved', '강남권', 'package', 25, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '리얼콜라겐 4종 Set', '셀르디엠 + 물광주사 1개', '셀르디엠 + 물광주사 1개', '1box + 2.5cc', null, null, 1, '1box + 2.5cc', 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '리얼콜라겐 4종 Set', '리투오 + 물광주사 1개', '리투오 + 물광주사 1개', '1box + 2.5cc', null, null, 1, '1box + 2.5cc', 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '리얼콜라겐 4종 Set', '쥬브아셀 8% + 물광주사 1개', '쥬브아셀 8% + 물광주사 1개', '1box + 2.5cc', null, null, 1, '1box + 2.5cc', 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '리얼콜라겐 4종 Set', '쥬브아셀 3% + 물광주사 1개', '쥬브아셀 3% + 물광주사 1개', '1box + 2.5cc', null, null, 1, '1box + 2.5cc', 280000, 28, 'high', 'approved', '강남권', 'package', 28, null),
  ((select id from public.price_sources where source_key = 'cnn-010'), '스킨부스터', '리얼콜라겐 4종 Set', '레티젠 + 물광주사 1개', '레티젠 + 물광주사 1개', '1box + 2.5cc', null, null, 1, '1box + 2.5cc', 360000, 36, 'high', 'approved', '강남권', 'package', 36, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '관리', '엠페이스 도입 이벤트', '엠페이스', '엠페이스', '1회', null, null, 1, '1회', 450000, 45, 'high', 'approved', '강남권', 'event', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '관리', '엠페이스 도입 이벤트', '엠페이스', '엠페이스', '3회', null, null, 3, '3회', 1250000, 125, 'high', 'approved', '강남권', 'event', 41.7, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '관리', '엠페이스 도입 이벤트', '엠페이스', '엠페이스', '5회', null, null, 5, '5회', 1990000, 199, 'high', 'approved', '강남권', 'event', 39.8, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '스킨부스터', '프리미엄 스킨부스터 이벤트', '리투오', '리투오', '1앰플', null, null, 1, '1앰플', 490000, 49, 'high', 'approved', '강남권', 'event', 49, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '스킨부스터', '프리미엄 스킨부스터 이벤트', '리바이브', '리바이브', '1cc', null, null, 1, '1cc', 260000, 26, 'high', 'approved', '강남권', 'event', 26, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '스킨부스터', '프리미엄 스킨부스터 이벤트', '스킨바이브', '스킨바이브', '2cc', null, null, 1, '2cc', 327000, 32.7, 'high', 'approved', '강남권', 'event', 32.7, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '스킨부스터', '프리미엄 스킨부스터 이벤트', '레티젠 패키지', '레티젠 패키지', '레티젠 2cc + 릴리이드 2cc + 히아록스', null, null, 1, '레티젠 2cc + 릴리이드 2cc + 히아록스', 500000, 50, 'medium', 'approved', '강남권', 'event', 50, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '필러', '요정 귀필러 이벤트', '레볼라인', '레볼라인', null, null, null, 1, null, 360000, 36, 'high', 'approved', '강남권', 'event', 36, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '필러', '요정 귀필러 이벤트', '에피 또는 더채움', '에피 또는 더채움', null, null, null, 1, null, 390000, 39, 'medium', 'approved', '강남권', 'event', 39, null),
  ((select id from public.price_sources where source_key = 'cnn-011'), '필러', '요정 귀필러 이벤트', '리쥬비엘', '리쥬비엘', null, null, null, 1, null, 420000, 42, 'high', 'approved', '강남권', 'event', 42, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '고압 산소 테라피', '고압 산소테라피', '고압 산소테라피', '30분', null, null, 1, '30분', 150000, 15, 'high', 'approved', '강남권', 'regular', 15, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '고압 산소 테라피', '고압 산소테라피', '고압 산소테라피', '60분', null, null, 1, '60분', 240000, 24, 'high', 'approved', '강남권', 'regular', 24, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '고압 산소 테라피', '고압 산소테라피', '고압 산소테라피', '30분 5회', null, null, 5, '30분 5회', 660000, 66, 'high', 'approved', '강남권', 'regular', 13.2, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '고압 산소 테라피', '고압 산소테라피', '고압 산소테라피', '60분 5회', null, null, 5, '60분 5회', 990000, 99, 'high', 'approved', '강남권', 'regular', 19.8, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '스킨부스터', '줄기세포 혈청 부스터', '30P 스킨부스터 + 커스텀 후관리', '30P 스킨부스터 + 커스텀 후관리', '1회', null, null, 1, '1회', 880000, 88, 'high', 'approved', '강남권', 'package', 88, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '스킨부스터', '줄기세포 혈청 부스터', '30P 스킨부스터 + 커스텀 후관리', '30P 스킨부스터 + 커스텀 후관리', '3회', null, null, 3, '3회', 1900000, 190, 'high', 'approved', '강남권', 'package', 63.3, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '스킨부스터', '줄기세포 혈청 부스터', '60P 인젝션 + 커스텀 후관리', '60P 인젝션 + 커스텀 후관리', '1회', null, null, 1, '1회', 1590000, 159, 'high', 'approved', '강남권', 'package', 159, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '스킨부스터', '줄기세포 혈청 부스터', '60P 인젝션 + 커스텀 후관리', '60P 인젝션 + 커스텀 후관리', '3회', null, null, 3, '3회', 4400000, 440, 'high', 'approved', '강남권', 'package', 146.7, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '줄기세포 혈청 부스터', '120P 항노화 프로그램', '120P 항노화 프로그램', '1회', '엑소좀, 혈청, 후관리', null, 1, '1회', 2900000, 290, 'medium', 'approved', '강남권', 'package', 290, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '줄기세포 혈청 부스터', '120P 항노화 프로그램', '120P 항노화 프로그램', '3회', '엑소좀, 혈청, 후관리', null, 3, '3회', 7900000, 790, 'medium', 'approved', '강남권', 'package', 263.3, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '줄기세포 혈청 부스터', '240P 항노화 프로그램', '240P 항노화 프로그램', '1회', '엑소좀, 혈청, 후관리', null, 1, '1회', 4900000, 490, 'medium', 'approved', '강남권', 'package', 490, null),
  ((select id from public.price_sources where source_key = 'cnn-012'), '관리', '줄기세포 혈청 부스터', '240P 항노화 프로그램', '240P 항노화 프로그램', '3회', '엑소좀, 혈청, 후관리', null, 3, '3회', 11000000, 1100, 'medium', 'approved', '강남권', 'package', 366.7, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '마늘주사', '마늘주사', null, null, null, 1, null, 39000, 3.9, 'high', 'approved', '강남권', 'regular', 3.9, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '백옥 + 신데렐라 + 글루타치온', '백옥 + 신데렐라 + 글루타치온', null, null, null, 1, null, 45000, 4.5, 'medium', 'approved', '강남권', 'package', 4.5, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '해장수액', '해장수액', '맥페란 + 글루타치온', null, null, 1, '맥페란 + 글루타치온', 40000, 4, 'medium', 'approved', '강남권', 'regular', 4, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '하이르민', '하이르민', null, null, null, 1, null, 30000, 3, 'medium', 'approved', '강남권', 'regular', 3, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '신델주', '신델주', null, null, null, 1, null, 30000, 3, 'medium', 'approved', '강남권', 'regular', 3, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '활력 & 에너지 부스팅', '아연', '아연', null, null, null, 1, null, 20000, 2, 'high', 'approved', '강남권', 'regular', 2, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '피부 & 항산화 케어', '글루타치온', '글루타치온', '2배', null, null, 1, '2배', 30000, 3, 'high', 'approved', '강남권', 'regular', 3, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '피부 & 항산화 케어', '글루타치온태반 실버', '글루타치온태반 실버', null, null, null, 1, null, 44000, 4.4, 'medium', 'approved', '강남권', 'regular', 4.4, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '두뇌 & 집중력 케어', '초명 진정주사', '초명 진정주사', null, null, null, 1, null, 50000, 5, 'medium', 'approved', '강남권', 'regular', 5, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '두뇌 & 집중력 케어', 'NAD + NMN 주사', 'NAD + NMN 주사', null, null, null, 1, null, 129000, 12.9, 'high', 'approved', '강남권', 'package', 12.9, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '두뇌 & 집중력 케어', '싸이모신알파', '싸이모신알파', null, null, null, 1, null, 70000, 7, 'high', 'approved', '강남권', 'regular', 7, null),
  ((select id from public.price_sources where source_key = 'cnn-013'), '관리', '통증 & 회복 케어', '진통몸살', '진통몸살', '트리마돌', null, null, 1, '트리마돌', 20000, 2, 'medium', 'approved', '강남권', 'regular', 2, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '필러', '세리아 추천 시술', '입술 필러 + 입꼬리 보톡스', '입술 필러 + 입꼬리 보톡스', '필러 1cc 국산 + 보톡스 국산', null, null, 1, '필러 1cc 국산 + 보톡스 국산', 99000, 9.9, 'high', 'approved', '강남권', 'package', 9.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '보톡스', '세리아 추천 시술', '얼굴 전체 스킨보톡스', '얼굴 전체 스킨보톡스', '국산', null, null, 1, '국산', 89000, 8.9, 'high', 'approved', '강남권', 'regular', 8.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '필러', '세리아 추천 시술', '엘프 리프팅', '엘프 리프팅', '1cc 국산', null, null, 1, '1cc 국산', 140000, 14, 'medium', 'approved', '강남권', 'regular', 14, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '필러', '세리아 추천 시술', '엘프 필러', '엘프 필러', '1cc 수입', null, null, 1, '1cc 수입', 290000, 29, 'medium', 'approved', '강남권', 'regular', 29, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '필러', '필러 시술', '턱끝 필러 + 자갈턱 보톡스', '턱끝 필러 + 자갈턱 보톡스', '필러 1cc 국산 + 보톡스 국산', null, null, 1, '필러 1cc 국산 + 보톡스 국산', 79000, 7.9, 'medium', 'approved', '강남권', 'package', 7.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '필러', '필러 시술', '목주름 더마 베이직', '목주름 더마 베이직', null, null, null, 1, null, 99000, 9.9, 'medium', 'approved', '강남권', 'regular', 9.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '슈링크 유니버스 + 리쥬란아이', '슈링크 유니버스 + 리쥬란아이', '300샷 + 2cc', null, null, 1, '300샷 + 2cc', 119000, 11.9, 'medium', 'approved', '강남권', 'package', 11.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '아이써마지FLX + 쥬베룩아이', '아이써마지FLX + 쥬베룩아이', '200샷 + 2cc', null, null, 1, '200샷 + 2cc', 259000, 25.9, 'medium', 'approved', '강남권', 'package', 25.9, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '티타늄 리프팅', '티타늄 리프팅', '30KJ', null, null, 1, '30KJ', 350000, 35, 'high', 'approved', '강남권', 'regular', 35, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '온다 리프팅', '온다 리프팅', '40KJ', null, null, 1, '40KJ', 280000, 28, 'medium', 'approved', '강남권', 'regular', 28, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '온다 리프팅', '온다 리프팅', '60KJ', null, null, 1, '60KJ', 390000, 39, 'medium', 'approved', '강남권', 'regular', 39, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '울쎄라피 프라임', '울쎄라피 프라임', '300샷', null, null, 1, '300샷', 990000, 99, 'high', 'approved', '강남권', 'regular', 99, null),
  ((select id from public.price_sources where source_key = 'cnn-014'), '리프팅', '얼굴 리프팅 & 윤곽 시술', '써마지 FLX', '써마지 FLX', '300샷', null, null, 1, '300샷', 990000, 99, 'high', 'approved', '강남권', 'regular', 99, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '모공흉터', '모공·흉터 개선 치료', '나비존 모공주사 + 진정재생관리', '나비존 모공주사 + 진정재생관리', '1cc', null, null, 1, '1cc', 350000, 35, 'high', 'approved', '강남권', 'package', 35, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '모공흉터', '모공·흉터 개선 치료', '펌핑 포텐자 + 쥬베룩 스킨', '펌핑 포텐자 + 쥬베룩 스킨', '4cc', null, null, 1, '4cc', 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '모공흉터', '모공·흉터 개선 치료', '포텐자 + 엑소좀 + 진정재생관리', '포텐자 + 엑소좀 + 진정재생관리', null, null, null, 1, null, 450000, 45, 'high', 'approved', '강남권', 'package', 45, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '모공흉터', '모공·흉터 개선 치료', '포텐자 + 리쥬란S + 진정재생관리', '포텐자 + 리쥬란S + 진정재생관리', '2cc', null, null, 1, '2cc', 550000, 55, 'medium', 'approved', '강남권', 'package', 55, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '색소', '미백·색소·토닝 레이저', '토닝 6개월 무제한권', '토닝 6개월 무제한권', null, null, null, null, null, 390000, 39, 'high', 'approved', '강남권', 'unlimited', null, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '색소', '미백·색소·토닝 레이저', '제네시스 6개월 무제한권', '제네시스 6개월 무제한권', null, null, null, null, null, 1290000, 129, 'high', 'approved', '강남권', 'unlimited', null, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '줄기세포 혈청 스킨부스터 + 소노', '줄기세포 혈청 스킨부스터 + 소노', '30P 1회', null, null, 1, '30P 1회', 690000, 69, 'high', 'approved', '강남권', 'package', 69, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '줄기세포 혈청 스킨부스터 + 리쥬란 HB', '줄기세포 혈청 스킨부스터 + 리쥬란 HB', '30P + 1cc', null, null, 1, '30P + 1cc', 850000, 85, 'high', 'approved', '강남권', 'package', 85, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '60P 인젝션 + 커스텀 관리', '60P 인젝션 + 커스텀 관리', null, null, null, 1, null, 1290000, 129, 'high', 'approved', '강남권', 'package', 129, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '관리', '스킨부스터·피부재생 시술', '60P + 엑소좀 + 고압산소', '60P + 엑소좀 + 고압산소', null, null, null, 1, null, 1450000, 145, 'high', 'approved', '강남권', 'package', 145, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '리쥬란 HB', '리쥬란 HB', '1cc', null, null, 1, '1cc', 390000, 39, 'high', 'approved', '강남권', 'regular', 39, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '리쥬란 HB', '리쥬란 HB', '2cc', null, null, 1, '2cc', 210000, 21, 'low', 'pending', '강남권', 'regular', 21, 'Image row was partially unclear and should be rechecked before production use.'),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '인젝션 + 커스텀관리', '인젝션 + 커스텀관리', null, null, null, 1, null, 650000, 65, 'medium', 'approved', '강남권', 'package', 65, null),
  ((select id from public.price_sources where source_key = 'cnn-015'), '스킨부스터', '스킨부스터·피부재생 시술', '엑소좀 + 고압산소', '엑소좀 + 고압산소', null, null, null, 1, null, 670000, 67, 'medium', 'approved', '강남권', 'package', 67, null);

-- ----------------------------------------------------------------------------
-- 5. 공개 스냅샷 + 지수 집계 갱신
--    중위값은 1회·세션 환산가(unit_price_manwon) 기준, regular/event 만 포함
--    package/addon/unlimited 는 원문 공개만 하고 집계에서는 제외
--    MVP 지역 필터: 강남권
-- ----------------------------------------------------------------------------
truncate public.price_index_evidence;

insert into public.price_index_evidence (
  canonical_treatment_name, category, region, evidence_kind, variant_text,
  package_components, session_count, price_manwon, unit_price_manwon,
  confidence, captured_date, source_type
)
select
  e.canonical_treatment_name,
  e.category,
  coalesce(e.region, '강남권'),
  e.evidence_kind,
  e.treatment_variant,
  e.package_components,
  e.session_count,
  e.price_manwon,
  e.unit_price_manwon,
  e.confidence,
  s.captured_date,
  s.source_type
from public.price_evidence e
left join public.price_sources s on s.id = e.source_id
where e.status = 'approved'
  and e.canonical_treatment_name is not null
  and coalesce(e.region, '강남권') = '강남권';

truncate public.price_index;

insert into public.price_index (
  canonical_treatment_name, category, region, evidence_count,
  min_price, p25_price, median_price, p75_price, max_price,
  last_evidence_at, confidence_grade
)
select
  canonical_treatment_name,
  max(category) as category,
  region,
  count(*) as evidence_count,
  min(unit_price_manwon),
  percentile_cont(0.25) within group (order by unit_price_manwon),
  percentile_cont(0.5) within group (order by unit_price_manwon),
  percentile_cont(0.75) within group (order by unit_price_manwon),
  max(unit_price_manwon),
  max(captured_date) as last_evidence_at,
  case when count(*) >= 5 then 'high' when count(*) >= 3 then 'medium' else 'low' end
from public.price_index_evidence
where unit_price_manwon is not null
  and evidence_kind in ('regular', 'event')
  and region = '강남권'
group by canonical_treatment_name, region;

-- 확인용:
-- select canonical_treatment_name, region, evidence_count, median_price from public.v_price_index_public order by evidence_count desc;
-- select count(*) from public.price_index_evidence;  -- 병원명 컬럼이 없어야 함
