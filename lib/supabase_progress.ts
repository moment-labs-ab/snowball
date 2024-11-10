import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid';
import { Habit, HabitTracking, ProgressData, HabitTrackingEntry } from '@/types/types'
import { getUserHabits, getHabit } from './supabase_habits'
import { DateTime } from 'luxon';
//type ProgressData = Record<string, number[]>;


const supabaseUrl = 'https://eykpncisvbuptalctkjx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxMTQ3MzgsImV4cCI6MjAzNTY5MDczOH0.mULscPjrRARbUp80OnVY_GQGUYMPhG6k-QCvGTZ4k3g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
function getRelativeDates(baseDate: Date) {
  // Create a new Date object for each calculation to avoid mutating the original date
  const oneWeekAgo = new Date(baseDate);
  oneWeekAgo.setDate(baseDate.getDate() - 7); // Subtract 7 days

  const oneMonthAgo = new Date(baseDate);
  oneMonthAgo.setMonth(baseDate.getMonth() - 1); // Subtract 1 month

  const startOfYear = new Date(baseDate.getFullYear(), 0, 1); // Set date to January 1st of the current year

  const oneYearAgo = new Date(baseDate);
  oneYearAgo.setFullYear(baseDate.getFullYear() - 1); // Subtract 1 year

  return { oneWeekAgo, oneMonthAgo, startOfYear, oneYearAgo };
}

export const getHabitTrackingCount = async (habit_id: string, startDate: string, endDate: string) =>{
  const { data, error, count } = await supabase
    .from('habit_tracking_history')
    .select('id', { count: 'exact' }) // 'exact' will return the total count of matching rows
    .eq('habit_id', habit_id)
    .gte('tracked_habit_date', startDate)
    .lte('tracked_at', endDate);

  if (error) {
    console.error('Error querying habit tracking history:', error);
    return null;
  }
  return count;
}

/**
* Function that will retrieve tracking history of user.
* @param date :The current date.
* @param user_id :user ID
*/
interface TrackingProgress {
  progress: number[];
  fromDates: Date[]
}
export const getTrackingProgress = async (userId: string, date: Date) => {
  const { oneWeekAgo, oneMonthAgo, startOfYear, oneYearAgo } = getRelativeDates(date);
  const history: { [habitName: string]: TrackingProgress} = {};
  const habitsData = await getUserHabits(userId);

  const promises = habitsData.map(async (habit) => {
    // Run all the counts for a habit in parallel
    const [weekCount, monthCount, yearToDate, yearCount, sinceJoinCount] = await Promise.all([
      getHabitTrackingCount(habit.id, oneWeekAgo.toISOString(), date.toISOString()),
      getHabitTrackingCount(habit.id, oneMonthAgo.toISOString(), date.toISOString()),
      getHabitTrackingCount(habit.id, startOfYear.toISOString(), date.toISOString()),
      getHabitTrackingCount(habit.id, oneYearAgo.toISOString(), date.toISOString()),
      getHabitTrackingCount(habit.id, new Date(habit.created_at).toISOString(), date.toISOString())
    ]);

    // Store the counts in the history object
    history[habit.id] ={ 
      progress: [
      weekCount ?? 0,
      monthCount ?? 0,
      yearToDate ?? 0,
      yearCount ?? 0,
      sinceJoinCount ?? 0
      ],
      fromDates: [
        oneWeekAgo,
        oneMonthAgo,
        startOfYear,
        oneYearAgo

      ]
    };
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  //console.log(history);
  return history;
};

/**
 * This function corrales all progress data needed to create the progress tab.
 * This function uses createBaselines() and getTrackingProgressData()
 * 
 * @param userId 
 * @param date current date
 * @returns ProgressData
 *  Progress, Baselines, Current Date, "From Dates" (based on time frames in progress tab), frequency of habit, frequence rate of habit, habit name.
 */
export const getFullProgressData = async (userId: string, date: Date) => {
  const progressData: ProgressData = {};
  const habitsData = await getUserHabits(userId);
  const progress = await getTrackingProgress(userId, date);
  const baselines = await createProgressBaselines(userId, date);

  // Map over habits and fetch required data for each habit
  const promises = habitsData.map(async (habit) => {
    const habitData: Habit | null = await getHabit(userId, habit.id);

    if (habitData && habitData.id) {
      const current_habit_id = habitData.id;

      // Gather progress, baselines, and other habit details
      return {
        id: current_habit_id,
        progress: progress[current_habit_id]?.progress || [],
        baselines: baselines[current_habit_id] || [],
        name: habitData.name,
        frequency: habitData.frequency,
        frequency_rate: habitData.frequency_rate,
        fromDates: progress[current_habit_id]?.fromDates || [],
        currentDate: date,
        createdAt: new Date(habitData.created_at)
      };
    } else {
      console.log("Unable to process Habits Progress Data.");
      return null;
    }
  });

  // Resolve all promises while maintaining order
  const resolvedHabits = await Promise.all(promises);

  // Filter out any null values and populate the progressData object
  resolvedHabits.forEach((habit) => {
    if (habit && habit.id) {
      progressData[habit.id] = {
        progress: habit.progress,
        baselines: habit.baselines,
        name: habit.name,
        frequency: habit.frequency,
        frequency_rate: habit.frequency_rate,
        fromDates: habit.fromDates,
        currentDate: habit.currentDate,
        createdAt: habit.createdAt
      };
    }
  });

  return progressData;
};
/**
 * Based on a user's habits and their goals for each habit, what should their expected progress be for the past
 * 1w, 1m, YTD, 1y, All time
 * @param userId :user ID
 */
export const createProgressBaselines = async (userId: string, currentDate: Date) => {
    const habitsData = await getUserHabits(userId);
    const baselines: { [habitName: string]: number[] } = {};

    // Loop through each habit and calculate the goals for different timeframes
    habitsData.forEach((habit) => {
        const frequencyRate = habit.frequency; // User-defined frequency rate
        const frequency = habit.frequency_rate; // Frequency: daily, weekly, bi-weekly, monthly, yearly

        // Initialize goals for different time frames
        let weekGoal = 0, monthGoal = 0, yearGoal = 0, ytdGoal = 0, sinceJoinGoal = 0;

        // Adjust the goals based on the frequency of the habit
        switch (frequency) {
            case 'Daily':
                weekGoal = frequencyRate * 7;
                monthGoal = frequencyRate * 30;  // Approximate month as 30 days
                yearGoal = frequencyRate * 365;
                ytdGoal = frequencyRate * getDaysSinceStartOfYear(currentDate);
                sinceJoinGoal = frequencyRate * getDaysSinceDate(habit.created_at, currentDate);
                break;
            case 'Weekly':
                weekGoal = frequencyRate;
                monthGoal = frequencyRate * 4;  // Approximate month as 4 weeks
                yearGoal = frequencyRate * 52;  // Approximate year as 52 weeks
                ytdGoal = frequencyRate * getWeeksSinceStartOfYear(currentDate);
                sinceJoinGoal = frequencyRate * getWeeksSinceDate(habit.created_at, currentDate);
                break;
            case 'Bi-weekly':
                weekGoal = frequencyRate / 2;  // Bi-weekly: 1 habit every 2 weeks
                monthGoal = frequencyRate * 2;  // 2 bi-weekly periods per month
                yearGoal = frequencyRate * 26;  // 26 bi-weekly periods per year
                ytdGoal = frequencyRate * (getWeeksSinceStartOfYear(currentDate) / 2);
                sinceJoinGoal = frequencyRate * (getWeeksSinceDate(habit.created_at, currentDate) / 2);
                break;
            case 'Monthly':
                weekGoal = frequencyRate / 4;  // Approximate 1 month = 4 weeks
                monthGoal = frequencyRate;
                yearGoal = frequencyRate * 12;  // 12 months in a year
                ytdGoal = frequencyRate * getMonthsSinceStartOfYear(currentDate);
                sinceJoinGoal = frequencyRate * getMonthsSinceDate(habit.created_at, currentDate);
                break;
            case 'Yearly':
                weekGoal = frequencyRate / 52;  // 52 weeks in a year
                monthGoal = frequencyRate / 12;  // 12 months in a year
                yearGoal = frequencyRate;
                ytdGoal = frequencyRate // YTD goal for yearly
                sinceJoinGoal = frequencyRate * getYearsSinceDate(habit.created_at, currentDate);
                break;
            default:
                break;
        }

        // Add the goals to the baselines object
        baselines[habit.id] = [weekGoal, monthGoal, ytdGoal, yearGoal, sinceJoinGoal];
    });

    //console.log(baselines);
    return baselines;
};

// Helper functions
const getDaysSinceStartOfYear = (currentDate: Date): number => {
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1); // January 1st of the current year
    const diffTime = currentDate.getTime() - startOfYear.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays + 1; // Include the current day
};
const getWeeksSinceStartOfYear = (currentDate: Date): number => {
    const daysSinceStartOfYear = getDaysSinceStartOfYear(currentDate);
    const weeksSinceStart = Math.floor(daysSinceStartOfYear / 7); // Convert days to weeks
    return weeksSinceStart + 1; // Include the current week
};
const getMonthsSinceStartOfYear = (currentDate: Date): number => {
    const currentMonth = currentDate.getMonth(); // January is 0, so this gives the 0-based month number
    return currentMonth + 1; // Include the current month
};

const getYearsSinceDate = (date: string, currentDate: Date): number => {
    const newDate = new Date(date)
    const startYear = newDate.getFullYear();
    const currentYear = currentDate.getFullYear();
    return currentYear - startYear;
};
const getWeeksSinceDate = (date: string, currentDate: Date): number => {
    // Get the difference in time between the two dates in milliseconds
    const newDate = new Date(date)
    const diffTime = currentDate.getTime() - newDate.getTime();
    
    // Convert the time difference from milliseconds to days, then to weeks
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Milliseconds to days
    const diffWeeks = Math.floor(diffDays / 7); // Days to weeks (rounded down)
    
    return diffWeeks + 1; // Include the current week
};

const getDaysSinceDate = (date: string, currentDate: Date): number => {
    const newDate = new Date(date); 
    return Math.floor((currentDate.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24));
};
const getMonthsSinceDate = (date: string, currentDate: Date): number => {
    const newDate = new Date(date)
    const startYear = newDate.getFullYear();
    const startMonth = newDate.getMonth(); // January is 0, December is 11
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Calculate the difference in months
    const yearDiff = currentYear - startYear;
    const monthDiff = currentMonth - startMonth;

    // Total months between the two dates
    const totalMonths = yearDiff * 12 + monthDiff;

    return totalMonths + 1; // Include the current month
};
export const getOneHabitTrackingProgress = async (habitId: string, date:Date, userId: string)=>{
  const { oneWeekAgo, oneMonthAgo, startOfYear, oneYearAgo } = getRelativeDates(date);

  const habitData: Habit | null = await getHabit(userId, habitId);


  if(habitData){
  const [weekCount, monthCount, yearToDate, yearCount, sinceJoinCount] = await Promise.all([
    getHabitTrackingCount(habitId, oneWeekAgo.toISOString(), date.toISOString()),
    getHabitTrackingCount(habitId, oneMonthAgo.toISOString(), date.toISOString()),
    getHabitTrackingCount(habitId, startOfYear.toISOString(), date.toISOString()),
    getHabitTrackingCount(habitId, oneYearAgo.toISOString(), date.toISOString()),
    getHabitTrackingCount(habitId, new Date(habitData.created_at).toISOString(), date.toISOString())
  ]);

  return [weekCount, monthCount, yearToDate, yearCount, sinceJoinCount]
  }else{
    console.log(habitData)
    console.log("Habit ID was not accepted in getOneHabitTrackingProgress or Habit Tracking Does not Exist.")
  }

}

type ChangeHandler = (payload: { eventType: string; habitId: string; new: number[]; old: number[]}) => void;
export const listenToTrackingHistory = (handleChange: ChangeHandler) => {
  const now = new Date();
  
    
  const subscription = supabase
    .channel('table_db_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habit_tracking_history',
      },
      async (payload: any) => {
        const eventType = payload.eventType;
        const id = payload.new.habit_id
        const user_id = payload.new.user_id
        const changed_habits_updated_progress = await getOneHabitTrackingProgress(id, now, user_id)
        console.log("Changed DATA in Listener",changed_habits_updated_progress)

        const newRecord = changed_habits_updated_progress as number[];
        const oldRecord = changed_habits_updated_progress as number[];
        handleChange({ eventType, habitId: id, new: newRecord, old: oldRecord });
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Given an habit Id, this will return 
 */
export const getHabitMetadata = async () =>{

}

/**
 * Function that pulls all tracking history between two time frames for a specific habit
 * @param userId 
 * @param habitId 
 * @param startDate 
 * @param endDate 
 */

export const getGridTrackingHistory = async (
  userId: string, 
  habitId: string, 
  startDate: Date, 
  endDate: Date
): Promise<HabitTrackingEntry[] | null>  => {
  
  
  const { data, error } = await supabase
    .from('habit_tracking_history')
    .select('tracked_habit_date', { count: 'exact' })
    .eq('habit_id', habitId)
    .gte('tracked_habit_date', startDate.toISOString())
    .lte('tracked_habit_date', endDate.toISOString())

  if (error) {
    console.error('Error querying habit tracking history:', error);
    return null;
  }


  // Step 2: Create an array of all dates between startDate and endDate
  const dateRange = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateRange.push(new Date(currentDate)); // Add a copy of the date
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  // Step 3: Convert the tracked habit dates from the database to a set for easy lookup
  const trackedDates = new Set(data?.map((entry: { tracked_habit_date: string }) => 
    new Date(entry.tracked_habit_date).toISOString().split('T')[0]
  ));

  // Step 4: Map over the date range and fill in with count 0 for missing dates
  const result = dateRange.map(date => {
    const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
    return {
      date: formattedDate,
      count: trackedDates.has(formattedDate) ? 1 : 0
    };
  });

  return result;
};

