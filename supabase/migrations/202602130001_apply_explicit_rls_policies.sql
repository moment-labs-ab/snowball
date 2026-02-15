-- Replace broad template-style RLS with explicit owner policies.

alter table public.profiles enable row level security;
drop policy if exists "Enable all actions for users based on user_id" on public.profiles;
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

do $$
declare
  table_name text;
  owner_policy_name text;
begin
  for table_name in
    select distinct c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'user_id'
  loop
    owner_policy_name := format('%s_owner_all', table_name);

    execute format('alter table public.%I enable row level security;', table_name);
    execute format('drop policy if exists %L on public.%I;', 'Enable all actions for users based on user_id', table_name);
    execute format('drop policy if exists %L on public.%I;', owner_policy_name, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      owner_policy_name,
      table_name
    );
  end loop;
end
$$;
