create table public.purchases (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null default auth.uid (),
  premium_type text null,
  customer_id text null,
  status text null,
  constraint purchases_pkey primary key (id),
  constraint purchases_user_id_key unique (user_id)
) TABLESPACE pg_default;