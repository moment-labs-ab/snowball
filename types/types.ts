import { Float } from "react-native/Libraries/Types/CodegenTypes";

export interface currentUserType {
  username?: string,
  email:string,
  userId: string
}
export interface Habit {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
    frequency_rate_int: number;
    order: number
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

export interface ProgressData {
  [habitId: string]:{
  progress: number[];
  baselines: number[];
  name: string;
  frequency: number; //frequency in habits table
  frequency_rate: string;
  fromDates: Date[];
  currentDate: Date;
  createdAt: Date;
  }
}

export interface HabitTrackingEntry {
  date: string;
  count: number;
};

export interface LifetimeHabitStats{
  totalDaysTracked: number;
  completionRate: number;
  mostConsistentHabit: string;
  longestStreak: number;
  joinDate: Date;
}

export interface Goal{
  id: string,
  created_at: Date,
  name: string,
  emoji: string,
  habit_ids: Record<string, string>,
  tags: Record<string, string>,
  user_id: string,
  description: string,
  expected_end_date: Date,
  milestones:Record<string, string>
}