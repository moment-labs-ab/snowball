create table public.goal_objects (
  created_at timestamp with time zone not null default now(),
  name text null,
  emoji text null,
  tags json null,
  user_id uuid null,
  description text null,
  expected_end_date date null,
  milestones jsonb null,
  color text null,
  accomplished boolean null default false,
  archived boolean null default false,
  accomplished_at date null,
  archived_at date null,
  id uuid not null default gen_random_uuid (),
  constraint goal_objects_pkey primary key (id),
  constraint vision_objects_user_id_fkey foreign KEY (user_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger set_accomplished_at BEFORE
update on goal_objects for EACH row
execute FUNCTION update_accomplished_at ();

create trigger set_archived_at BEFORE
update on goal_objects for EACH row
execute FUNCTION update_archived_at ();