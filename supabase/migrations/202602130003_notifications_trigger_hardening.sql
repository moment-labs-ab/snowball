-- Remove insecure trigger that embeds a long-lived service role token in DDL.
-- Notification state is now read/written from public.profiles.

drop trigger if exists "sendPushNotifications" on public.user_notifications;
