create or replace function public.get_profile_visitor_summary()
returns table (
  visitor_session_id text,
  ip_address text,
  device_type text,
  os_name text,
  browser_name text,
  visitor_name text,
  page_views bigint,
  heartbeats bigint,
  last_seen timestamptz,
  pages text[]
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
      and au.role = 'owner'
  ) then
    raise exception 'OWNER_REQUIRED';
  end if;

  return query
  select
    e.visitor_session_id,
    max(e.ip_address),
    max(e.device_type),
    max(e.os_name),
    max(e.browser_name),
    max(e.visitor_name),
    count(*) filter (where e.event_type = 'page_view'),
    count(*) filter (where e.event_type = 'heartbeat'),
    max(e.created_at),
    coalesce(array_agg(distinct e.page_path) filter (where e.event_type = 'page_view' and e.page_path is not null), array[]::text[])
  from public.analytics_events e
  where e.visitor_session_id is not null
  group by e.visitor_session_id
  order by max(e.created_at) desc;
end;
$function$;

revoke all on function public.get_profile_visitor_summary() from public, anon;
grant execute on function public.get_profile_visitor_summary() to authenticated;