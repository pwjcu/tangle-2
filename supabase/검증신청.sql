-- 탱글 검증 병원 신청서 저장 테이블
-- Supabase 대시보드 → SQL Editor에서 한 번 실행한 뒤, Vercel 환경변수 VERIFIED_APPLY_ENABLED=true 로 켭니다.
-- 누구나 신청서를 "넣을" 수만 있고, 읽기·수정·삭제는 대시보드(서비스 권한)에서만 가능합니다.

create table if not exists public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  clinic text not null check (char_length(clinic) between 2 and 80),
  doctor text not null check (char_length(doctor) between 2 and 40),
  specialty text not null check (char_length(specialty) between 2 and 60),
  address text not null check (char_length(address) between 5 and 160),
  contact_name text not null check (char_length(contact_name) between 2 and 40),
  contact_phone text not null check (char_length(contact_phone) between 8 and 20),
  contact_email text check (contact_email is null or char_length(contact_email) <= 120),
  website text check (website is null or char_length(website) <= 300),
  performs_surgery boolean not null,
  declarations jsonb not null,
  disclosure text check (disclosure is null or char_length(disclosure) <= 1000),
  consent boolean not null check (consent),
  status text not null default 'received' check (status in ('received', 'reviewing', 'approved', 'rejected'))
);

alter table public.verification_applications enable row level security;

revoke all on public.verification_applications from anon, authenticated;
grant insert on public.verification_applications to anon, authenticated;

drop policy if exists "anyone can submit an application" on public.verification_applications;
create policy "anyone can submit an application"
  on public.verification_applications
  for insert
  to anon, authenticated
  with check (status = 'received' and consent);

-- 보유 기간: 심사 종료 후 1년. 아래 쿼리를 주기적으로 실행해 지난 신청서를 지웁니다.
-- delete from public.verification_applications where created_at < now() - interval '1 year 3 months' and status in ('approved', 'rejected');
