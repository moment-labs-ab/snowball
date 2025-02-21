import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { NotificationItem } from '@/types/types'


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

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('id, label, time') // Only fetch count without data
        .eq('user_id', userId);
  
        if (error && userId) {
            console.error('Error fetching habits:', error);
            return [];
          }
          return data as NotificationItem[];
        }
    catch{
        return []

    }
}

export const saveNotifications = async (userId: string, notifications: NotificationItem[]) => {
  try {
    await supabase.from("user_notifications").delete().eq("user_id", userId);
    
    if (notifications.length > 0) {
      const { error } = await supabase.from("user_notifications").insert(
        notifications.map(({ label, time }) => ({ user_id: userId, label, time }))
      );
      if (error) {
        console.error("Error saving notifications:", error);
      }
    }
  } catch (error) {
    console.error("Unexpected error saving notifications:", error);
  }
};