export interface Habit {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
    frequency_rate_int: number;
  }

export interface HabitTracking {
  id: string,
  tracked_at: string,
  user_id: string,
  habit_id: string,
  time_frame_start: string,
  time_frame_end: string,
  tracking_count: number,
  tracking_goal: number,
  frequency_rate_int: number
}