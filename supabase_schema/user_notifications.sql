create table public.user_notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  expo_push_token text null,
  last_updated timestamp with time zone not null default now(),
  constraint user_notifications_pkey primary key (id),
  constraint user_notifications_user_id_fkey foreign KEY (user_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create trigger "sendPushNotifications"
after
update on user_notifications for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://eykpncisvbuptalctkjx.supabase.co/functions/v1/push',
  'POST',
  '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDExNDczOCwiZXhwIjoyMDM1NjkwNzM4fQ.5ljg1CSbwLaXvrAhc8MMlJYJAKNkKtIx978tTYrc0XY"}',
  '{}',
  '5000'
);