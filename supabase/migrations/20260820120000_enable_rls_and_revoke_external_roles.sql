-- App talks to Postgres exclusively via the service-role key (bypasses RLS).
-- These changes remove direct table exposure to anon/authenticated (PostgREST
-- and GraphQL) that the app never uses.

-- 1. Enable RLS on the two tables that were wide open
alter table public.links enable row level security;
alter table public.link_access_logs enable row level security;

-- 2. Drop every policy that targets anon/authenticated on the exposed tables.
--    service_role bypasses RLS, so the app is unaffected.
do $$
declare p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('links', 'link_access_logs', 'click_analytics', 'users')
      and roles::text[] && array['anon', 'authenticated']
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 3. Remove all privileges from anon/authenticated (kills PostgREST + GraphQL exposure)
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- 4. Harden mutable search_path on the existing helper functions
alter function public.update_updated_at_column() set search_path = pg_catalog, public;
alter function public.increment_user_total_links() set search_path = pg_catalog, public;
alter function public.increment_user_total_clicks() set search_path = pg_catalog, public;
alter function public.increment(uuid, integer) set search_path = pg_catalog, public;

-- 5. Atomic click recording used by the redirect route (avoids lost-update races)
create or replace function public.record_click(p_link_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_max_clicks integer;
  v_current   integer;
begin
  select max_clicks, clicks_count into v_max_clicks, v_current
  from public.links
  where id = p_link_id
  for update;

  if not found then
    return false;
  end if;

  if v_max_clicks is not null and v_current >= v_max_clicks then
    return false;
  end if;

  update public.links
  set clicks_count = clicks_count + 1, last_clicked_at = now()
  where id = p_link_id;

  return true;
end;
$$;

revoke all on function public.record_click(uuid) from public, anon, authenticated;