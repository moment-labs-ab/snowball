import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid';
import { Habit, HabitTracking, currentUserType, LifetimeHabitStats } from '@/types/types'


const supabaseUrl = 'https://eykpncisvbuptalctkjx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxMTQ3MzgsImV4cCI6MjAzNTY5MDczOH0.mULscPjrRARbUp80OnVY_GQGUYMPhG6k-QCvGTZ4k3g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export async function getUserLoginCount(user_id: string): Promise<number | null> {
    try {
      const { data, error, count } = await supabase
        .from('user_logins')
        .select('id', { count: 'exact', head: true }) // Only fetch count without data
        .eq('user_id', user_id);
  
      if (error) {
        console.error('Error fetching unique login count:', error);
        return null;
      }
  
      return count ?? 0; // Return count or 0 if count is null
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  }

 


  export const getLifetimeHabitStats = async (
    user_id: string
): Promise<LifetimeHabitStats | null> => {
        // Get user join date
        const { data: loginData, error: loginError } = await supabase
            .from('user_logins')
            .select('logged_in_at')
            .eq('user_id', user_id)
            .order('logged_in_at', { ascending: true })
            .limit(1)
            .single();

        if (loginError) throw loginError;

        // Get all habits and their creation dates
        const { data: habitsData, error: habitsError } = await supabase
            .from('habits')
            .select('id, name, created_at')
            .eq('user_id', user_id);

        if (habitsError) throw habitsError;

        // Get all tracking history
        const { data: trackingData, error: trackingError } = await supabase
            .from('habit_tracking_history')
            .select('habit_id, tracked_habit_date')
            .eq('user_id', user_id)
            .order('tracked_habit_date', { ascending: true });

        if (trackingError) throw trackingError;

        // Calculate total days tracked
        const totalDaysTracked = trackingData.length;

        // Calculate habit frequencies and find most consistent habit
        const habitFrequency: { [key: string]: number } = {};
        habitsData.forEach(habit => {
            habitFrequency[habit.id] = trackingData.filter(
                track => track.habit_id === habit.id
            ).length;
        });

        const mostFrequentHabitId = Object.entries(habitFrequency).reduce(
            (a, b) => (b[1] > a[1] ? b : a)
        )[0];

        const mostConsistentHabit = habitsData.find(
            h => h.id === mostFrequentHabitId
        )?.name || '';

        // Calculate completion rates for each habit
        const completionRates = habitsData.map(habit => {
            const habitStartDate = new Date(habit.created_at);
            const totalPossibleDays = Math.floor(
                (new Date().getTime() - habitStartDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const daysTracked = habitFrequency[habit.id] || 0;
            return (daysTracked / totalPossibleDays) * 100;
        });

        // Calculate average completion rate
        const completionRate = completionRates.length
            ? Math.floor(completionRates.reduce((a, b) => a + b) / completionRates.length)
            : 0;

        // Calculate current/most recent longest streak
        let longestStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        habitsData.forEach(habit => {
            const habitTracking = trackingData
                .filter(track => track.habit_id === habit.id)
                .map(track => new Date(track.tracked_habit_date))
                .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order to start from most recent

            if (habitTracking.length === 0) return;

            let currentStreak = 1;
            const mostRecent = habitTracking[0];
            mostRecent.setHours(0, 0, 0, 0);

            // If the most recent tracking is not today or yesterday, streak is 0
            const daysSinceLastTracking = Math.floor(
                (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            if (daysSinceLastTracking > 1) {
                longestStreak = Math.max(longestStreak, 0);
                return;
            }

            // Calculate current streak
            for (let i = 1; i < habitTracking.length; i++) {
                const current = habitTracking[i];
                const previous = habitTracking[i - 1];
                current.setHours(0, 0, 0, 0);
                previous.setHours(0, 0, 0, 0);

                const dayDiff = Math.floor(
                    (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (dayDiff === 1) {
                    currentStreak++;
                } else {
                    break; // Stop counting as soon as we find a break in the streak
                }
            }

            longestStreak = Math.max(longestStreak, currentStreak);
        });

        return {
            totalDaysTracked,
            completionRate,
            mostConsistentHabit,
            longestStreak,
            joinDate: new Date(loginData.logged_in_at)
        };
};