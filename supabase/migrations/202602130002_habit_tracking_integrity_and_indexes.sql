-- Normalize and protect tracking tables used by the app.

update public.habit_tracking_history
set tracked_habit_date = (tracked_at at time zone 'utc')::date
where tracked_habit_date is null;

with duplicate_windows as (
  select
    user_id,
    habit_id,
    time_frame_start,
    time_frame_end,
    min(id) as keep_id,
    sum(coalesce(tracking_count, 0)) as merged_tracking_count,
    max(coalesce(tracking_goal, 0)) as merged_tracking_goal,
    max(coalesce(frequency_rate_int, 0)) as merged_frequency_rate_int
  from public.habit_tracking
  where user_id is not null
    and habit_id is not null
    and time_frame_start is not null
    and time_frame_end is not null
  group by user_id, habit_id, time_frame_start, time_frame_end
  having count(*) > 1
),
updated_windows as (
  update public.habit_tracking ht
  set
    tracking_count = d.merged_tracking_count,
    tracking_goal = d.merged_tracking_goal,
    frequency_rate_int = d.merged_frequency_rate_int
  from duplicate_windows d
  where ht.id = d.keep_id
  returning ht.id
)
delete from public.habit_tracking ht
using duplicate_windows d
where ht.user_id = d.user_id
  and ht.habit_id = d.habit_id
  and ht.time_frame_start = d.time_frame_start
  and ht.time_frame_end = d.time_frame_end
  and ht.id <> d.keep_id;

create unique index if not exists habit_tracking_user_habit_window_uq
  on public.habit_tracking (user_id, habit_id, time_frame_start, time_frame_end)
  where user_id is not null
    and habit_id is not null
    and time_frame_start is not null
    and time_frame_end is not null;

create index if not exists habit_tracking_user_habit_dates_idx
  on public.habit_tracking (user_id, habit_id, time_frame_start, time_frame_end);

create index if not exists habit_tracking_history_user_habit_date_idx
  on public.habit_tracking_history (user_id, habit_id, tracked_habit_date);

alter table public.habit_tracking
  drop constraint if exists habit_tracking_non_negative_count;

alter table public.habit_tracking
  add constraint habit_tracking_non_negative_count
  check (tracking_count is null or tracking_count >= 0);
