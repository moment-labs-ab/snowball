create table public.habit_tracking_history (
  id uuid not null default gen_random_uuid (),
  tracking_id uuid not null default gen_random_uuid (),
  tracked_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  habit_id uuid null default gen_random_uuid (),
  tracked_habit_date date null,
  user_id uuid null,
  constraint habit_tracking_history_pkey primary key (id),
  constraint habit_tracking_history_habit_id_fkey foreign KEY (habit_id) references habits (id) on update CASCADE on delete CASCADE,
  constraint habit_tracking_history_tracking_id_fkey1 foreign KEY (tracking_id) references habit_tracking (id) on update CASCADE on delete CASCADE,
  constraint habit_tracking_history_user_id_fkey foreign KEY (user_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;