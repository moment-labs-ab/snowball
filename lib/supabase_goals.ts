import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid';
import { Goal } from '@/types/types'


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

export const insertNewGoal= async(
    name: string,
    emoji:string,
    habit_ids:object,
    user_id: string,
    description: string,
    tags?:object):Promise<{ success: boolean; message: string; data?: any }>=>{
    const { data, error } = await supabase
      .from('goal_objects')
      .insert([
        {
          name,
          emoji,
          habit_ids,
          tags,
          user_id,
          description
        },
      ]);

      if (error) {
        console.error('Error inserting goal:', error);
        return { success: false, message: 'Error inserting goal', data: error };
      } else {
        console.log('Goal inserted successfully:', data, error);
        return { success: true, message: 'Goal inserted successfully', data };
      }
}

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase.from('goal_objects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: true });
  if (error && userId) {
    console.error('Error fetching habits:', error);
    return [];
  }
  console.log(data)
  return data as Goal[];
};
