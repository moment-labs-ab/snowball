export type User = {
    username?: string;
    name?: string;
    email: string;
    userId: string;
    premiumUser: boolean;
};

export interface Habit {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
    frequency_rate_int: number;
    order: number,
    emoji: string,
    archived: boolean,
    archived_at: string
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
interface SelectedHabits {
  id: string;
  name: string;
}

export interface Goal{
  id: string,
  created_at: Date,
  name: string,
  emoji: string,
  habit_ids: SelectedHabits[],
  tags: Record<string, string>,
  description: string,
  expected_end_date: Date,
  milestones:Milestones[],
  color: string,
  accomplished: boolean,
  archived: boolean,
  accomplished_at: Date,
  archived_at: Date
}

export interface Milestones {
  milestone: string;
  checked: boolean
  date?: Date;
  
}

export interface NotificationItem {
  id: number;
  label: string;
  time: string;
  expo_push_token: string;
}