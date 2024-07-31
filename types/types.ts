export interface Habit {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
  }