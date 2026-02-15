create table public.goal_habits_reference (
  goal_id uuid not null,
  habit_id uuid not null,
  habit_name text not null,
  user_id uuid null,
  constraint goal_habits_reference_pkey primary key (goal_id, habit_id),
  constraint goal_habits_reference_goal_id_fkey foreign KEY (goal_id) references goal_objects (id) on update CASCADE on delete CASCADE,
  constraint goal_habits_reference_habit_id_fkey foreign KEY (habit_id) references habits (id) on update CASCADE on delete CASCADE,
  constraint goal_habits_reference_user_id_fkey foreign KEY (user_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;