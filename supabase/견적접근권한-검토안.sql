-- 검토용 SQL: 자동 실행하지 않습니다.
-- 운영 스키마·기존 정책·백업을 확인한 다음 별도 테스트 DB에서 검증하세요.
-- 기존 요청을 이메일만으로 현재 계정에 귀속시키지 않습니다.
begin;

alter table public.requests add column if not exists user_id uuid references auth.users(id);
alter table public.bids add column if not exists clinic_user_id uuid references auth.users(id);

create or replace function public.tangle_approved_partner()
returns boolean language sql stable security invoker set search_path = ''
as $$
 select coalesce((auth.jwt()->'app_metadata'->>'tangle_approved') = 'true'
   and (auth.jwt()->'app_metadata'->>'tangle_role') in ('clinic','admin'), false);
$$;

alter table public.requests enable row level security;
alter table public.bids enable row level security;

-- Restrictive guards must AND with any existing broad policies.
-- Explicit allow policies also support databases without existing policies.
create policy tangle_request_read_guard on public.requests as restrictive for select to anon, authenticated
using (auth.uid() = user_id or public.tangle_approved_partner());
create policy tangle_request_read on public.requests for select to authenticated
using (auth.uid() = user_id or public.tangle_approved_partner());
create policy tangle_request_insert_guard on public.requests as restrictive for insert to anon, authenticated
with check (auth.uid() = user_id and user_email = (auth.jwt()->>'email') and status = 'open');
create policy tangle_request_insert on public.requests for insert to authenticated
with check (auth.uid() = user_id and user_email = (auth.jwt()->>'email') and status = 'open');
create policy tangle_request_update_guard on public.requests as restrictive for update to anon, authenticated
using (false) with check (false);
create policy tangle_request_delete_guard on public.requests as restrictive for delete to anon, authenticated
using (false);

create policy tangle_bid_read_guard on public.bids as restrictive for select to anon, authenticated
using (auth.uid() = clinic_user_id or exists (
 select 1 from public.requests r where r.id = request_id and r.user_id = auth.uid()
));
create policy tangle_bid_read on public.bids for select to authenticated
using (auth.uid() = clinic_user_id or exists (
 select 1 from public.requests r where r.id = request_id and r.user_id = auth.uid()
));
create policy tangle_bid_insert_guard on public.bids as restrictive for insert to anon, authenticated
with check (public.tangle_approved_partner() and auth.uid() = clinic_user_id
 and hospital_name = (auth.jwt()->'app_metadata'->>'tangle_clinic_name')
 and price > 0 and price <= 100000 and selected = false
 and exists (select 1 from public.requests r where r.id = request_id and r.status = 'open'));
create policy tangle_bid_insert on public.bids for insert to authenticated
with check (public.tangle_approved_partner() and auth.uid() = clinic_user_id
 and hospital_name = (auth.jwt()->'app_metadata'->>'tangle_clinic_name')
 and price > 0 and price <= 100000 and selected = false
 and exists (select 1 from public.requests r where r.id = request_id and r.status = 'open'));
create policy tangle_bid_update_guard on public.bids as restrictive for update to anon, authenticated
using (false) with check (false);
create policy tangle_bid_delete_guard on public.bids as restrictive for delete to anon, authenticated
using (false);

-- Partners do not need requester email. Replacing table-level SELECT with
-- explicit columns also restricts direct browser queries using an authenticated key.
revoke select on public.requests from anon, authenticated;
grant select (id, user_id, category, symptom, budget, preferred_area, status, created_at)
on public.requests to authenticated;
revoke insert, update, delete on public.requests, public.bids from anon;
revoke update, delete on public.requests, public.bids from authenticated;
grant insert on public.requests, public.bids to authenticated;
grant select on public.bids to authenticated;

create unique index if not exists tangle_one_bid_per_clinic_request
on public.bids(request_id, clinic_user_id) where clinic_user_id is not null;
commit;

-- Review sequence INSERT privileges for the actual PK type, existing triggers,
-- policies assigned to other roles, views/functions and Supabase grants separately.
-- Never expose a service_role key in browser code. Enable QUOTE_WORKFLOW_ENABLED
-- only after anon/owner/non-owner/approved-clinic access tests pass.
