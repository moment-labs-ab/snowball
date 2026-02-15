create table public.habits (
  id uuid not null default gen_random_uuid (),
  created_at date not null,
  user_id uuid null,
  name text null,
  frequency bigint null,
  frequency_rate text null,
  reminder boolean null,
  frequency_rate_int bigint null,
  "order" bigint null,
  emoji text null,
  archived boolean null default false,
  archived_at date null,
  constraint habits_pkey primary key (id),
  constraint habits_user_id_fkey foreign KEY (user_id) references profiles (id)
) TABLESPACE pg_default;

create trigger set_archived_at BEFORE
update on habits for EACH row
execute FUNCTION update_archived_at ();