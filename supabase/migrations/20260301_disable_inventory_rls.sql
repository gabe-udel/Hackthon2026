-- Disable RLS and remove policies for inventory tables.
-- Safe to run repeatedly.

alter table if exists public.inventory disable row level security;
alter table if exists public.inventory_logs disable row level security;

do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('inventory', 'inventory_logs')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

notify pgrst, 'reload schema';
