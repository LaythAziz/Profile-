alter table public.analytics_events
  add column if not exists visitor_session_id text,
  add column if not exists ip_address text,
  add column if not exists device_type text,
  add column if not exists os_name text,
  add column if not exists browser_name text,
  add column if not exists visitor_name text;

create index if not exists analytics_events_session_created_idx on public.analytics_events(visitor_session_id, created_at desc);
create index if not exists analytics_events_ip_created_idx on public.analytics_events(ip_address, created_at desc);
create index if not exists analytics_events_created_type_idx on public.analytics_events(created_at desc, event_type);

drop policy if exists "Admins can manage analytics" on public.analytics_events;
create policy "Only active owner can manage analytics" on public.analytics_events for all to authenticated
using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'))
with check (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'));

drop policy if exists "Admins can insert services" on public.services;
drop policy if exists "Admins can update services" on public.services;
drop policy if exists "Admins can delete services" on public.services;
create policy "Only active owner can insert services" on public.services for insert to authenticated
with check (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'));
create policy "Only active owner can update services" on public.services for update to authenticated
using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'))
with check (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'));
create policy "Only active owner can delete services" on public.services for delete to authenticated
using (exists (select 1 from public.admin_users au where au.user_id=(select auth.uid()) and au.is_active=true and au.role='owner'));