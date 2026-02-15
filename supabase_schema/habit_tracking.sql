create table public.habit_tracking (
  id uuid not null default gen_random_uuid (),
  tracked_at timestamp with time zone not null default now(),
  habit_id uuid null,
  user_id uuid null,
  time_frame_start date null,
  time_frame_end date null,
  tracking_count bigint null,
  tracking_goal bigint null,
  frequency_rate_int bigint null,
  constraint habit_tracking_pkey primary key (id),
  constraint habit_tracking_habit_id_fkey foreign KEY (habit_id) references habits (id) on update CASCADE on delete CASCADE,
  constraint habit_tracking_user_id_fkey foreign KEY (user_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;