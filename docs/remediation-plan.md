# Snowball Remediation Plan

## Scope
This document tracks the approved remediation work that is implemented now.
Offline-first/local-device persistence is explicitly deferred.

## Phase 1: Auth and Session Reliability
- [x] Make `getCurrentUser` return `null` when there is no authenticated session.
- [x] Prevent global login state from being set to `true` from empty/default user objects.
- [x] Remove login tracking side effect from render path in `app/index.tsx`.
- [x] Require valid auth results before setting user session in sign-in flow.
- [x] Add early form validation and consistent failure handling in sign-in/sign-up/forgot-password screens.

## Phase 2: Notification Data Consistency
- [x] Set notification source-of-truth to `profiles` (`expo_push_token`, `notification_time`).
- [x] Update notification helpers to read/write from `profiles` only.
- [x] Normalize local state initialization and update flow in notification settings UI.

## Phase 3: Tracking Accuracy and Date Integrity
- [x] Standardize app-side date filters for `date` columns to `YYYY-MM-DD`.
- [x] Fix wrong table reference (`habits_tracking` -> `habit_tracking`).
- [x] Fix `tracked_habit_date` writes to use date-only format.
- [x] Correct progress count query to filter by `tracked_habit_date` end range.
- [x] Add user filter to grid-history query for strict isolation.

## Phase 4: UI/State and React Reliability
- [x] Remove dependency loops in settings/profile stats effects.
- [x] Avoid in-place mutation of goals context array while sorting.
- [x] Rename goals tab component to a capitalized React component.
- [x] Pass through `keyboardType` in shared form field component.

## Phase 5: Account Deletion and Secret Hardening
- [x] Route account deletion through Supabase Edge Function invocation.
- [x] Remove direct client-side admin user deletion calls.
- [x] Replace hardcoded Supabase keys in edge function source with environment variable usage.
- [x] Require bearer token and enforce self-delete authorization in edge function handler.

## Phase 6: Database Migrations
Added migrations in `/supabase/migrations`:

1. `202602130001_apply_explicit_rls_policies.sql`
- Enables RLS and creates explicit owner policies.
- Replaces template-style broad policy usage.

2. `202602130002_habit_tracking_integrity_and_indexes.sql`
- Backfills missing `tracked_habit_date`.
- Merges duplicate habit-tracking windows and removes duplicates.
- Adds unique/index constraints for query performance and data consistency.
- Adds non-negative check constraint for `tracking_count`.

3. `202602130003_notifications_trigger_hardening.sql`
- Drops insecure trigger that embedded a long-lived service-role token.

## Deferred Work
- [ ] Offline-first/device-first local persistence with sync queue and conflict strategy.

## Validation Checklist
- [ ] Run `npm run lint`
- [ ] Run `npx tsc --noEmit`
- [ ] Smoke test auth flows (sign-in/sign-up/reset).
- [ ] Smoke test notification enable/disable/time update.
- [ ] Smoke test habit tracking increment/decrement and progress views.
- [ ] Apply migrations to staging and confirm RLS behavior with real users.
