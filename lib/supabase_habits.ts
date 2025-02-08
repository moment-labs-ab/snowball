import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid';
import { Habit, HabitTracking } from '@/types/types'


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
//**
 /* Helper function to convert a frequency string to a numerical representation.
 * @param frequency 
 * @returns 
 */
 export function getFrequencyNumber(frequency: string): number {
    switch (frequency) {
        case "Daily":
            return 1;
        case "Weekly":
            return 7;
        case "Bi-weekly":
            return 14;
        case "Monthly":
            return 30; // or 28/31 depending on your requirements
        case "Bi-monthly":
            return 60; // or 56/62
        case "Quarterly":
            return 90; // or 91/92
        case "Semi-annually":
            return 180; // or 182/183
        case "Yearly":
            return 365; // or 366
        default:
            throw new Error("Invalid frequency");
    }
}

//** Inserts a new habit into the habit table.
 /* 
 * @param user_id
 * @param name (habit name)
 * @param reminder (Boolean if user wants a reminder or not)
 * @param frequency (How many times they want to track habit in a given time frame)
 * @param frequency_rate (The time frame in which a user wants to track a habit)
 * @returns 
 */
  export const insertHabit = async (
    user_id: string,
    name: string,
    reminder: boolean,
    frequency: number,
    frequency_rate: string,
    emoji: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    if(name === 'Habit' || frequency === 0){
      return { success: false, message: 'Please fill both name and frequency fields', data: undefined }; 
  }
  else{
    const currentHabitCount = await getHabitCount(user_id)

    const frequency_rate_int = getFrequencyNumber(frequency_rate)

    const created_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          created_at,
          user_id,
          name,
          frequency,
          frequency_rate,
          reminder,
          frequency_rate_int,
          'order':currentHabitCount,
          emoji
        },
      ]);
  
    if (error) {
      console.error('Error inserting habit:', error);
      return { success: false, message: 'Error inserting habit', data: error };
    } else {
      //console.log('Habit inserted successfully:', data, error);
      return { success: true, message: 'Habit inserted successfully', data };
    }
  }
}

export const getHabitCount = async (userId: string): Promise<number | null> => {
  try {
    const { data, error, count } = await supabase
      .from('habits')
      .select('id', { count: 'exact', head: true }) // Only fetch count without data
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching Habits Count:', error);
      return null;
    }
    return count ?? 0; // Return count or 0 if count is null
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

export const updateHabitOrder = async (
  habitId: string,
  newOrder: number,
  userId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .update({ order: newOrder })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating habit order:', error);
      return { success: false, message: 'Error updating habit order', data: error };
    }
    
    return { success: true, message: 'Habit order updated successfully', data };
  } catch (error) {
    console.error('Error in updateHabitOrder:', error);
    return { success: false, message: 'Unexpected error updating habit order', data: error };
  }
};

export const updateHabitIfChanged = async (
  habit_id: string,
  user_id: string,
  name: string,
  reminder: boolean,
  frequency: number,
  frequency_rate: string,
  emoji: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  if (name === 'Habit' || frequency === 0) {
    return { success: false, message: 'Please fill both name and frequency fields', data: undefined };
  }

  // Fetch the existing habit from the database
  const { data: existingHabit, error: fetchError } = await supabase
    .from('habits')
    .select('*')
    .eq('id', habit_id)
    .eq('user_id', user_id)
    .single();

  if (fetchError && user_id) {
    console.error('Error fetching habit:', fetchError);
    return { success: false, message: 'Error fetching habit', data: fetchError };
  }

  if (!existingHabit) {
    return { success: false, message: 'Habit not found', data: undefined };
  }

  // Calculate frequency_rate_int
  const frequency_rate_int = getFrequencyNumber(frequency_rate);

  // Check if any field has changed
  //console.log(existingHabit.emoji != emoji)
  const hasChanged =
    existingHabit.name !== name ||
    existingHabit.reminder !== reminder ||
    existingHabit.frequency !== frequency ||
    existingHabit.frequency_rate !== frequency_rate ||
    existingHabit.frequency_rate_int !== frequency_rate_int ||
    existingHabit.emoji !== emoji;

  if (!hasChanged) {
    return { success: true, message: 'No changes detected', data: existingHabit };
  }

  // Update the habit if any field has changed
  const { data, error } = await supabase
    .from('habits')
    .update({
      name,
      reminder,
      frequency,
      frequency_rate,
      frequency_rate_int,
      "emoji":emoji
    })
    .eq('id', habit_id);

  if (error) {
    console.error('Error updating habit:', error);
    return { success: false, message: 'Error updating habit', data: error };
  } else {
    //console.log('Habit updated successfully:', data);
    return { success: true, message: 'Habit updated successfully', data };
  }
};


export const deleteHabit = async (
  habit_id: string,
  user_id: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  // Check if the habit exists and belongs to the user
  const { data: existingHabit, error: fetchError } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habit_id)
    .eq('user_id', user_id)
    .single();

  if (fetchError && user_id) {
    console.error('Error fetching habit:', fetchError);
    return { success: false, message: 'Error fetching habit', data: fetchError };
  }

  if (!existingHabit) {
    return { success: false, message: 'Habit not found or does not belong to the user', data: undefined };
  }

  // Delete the habit
  const { data, error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habit_id)
    .eq('user_id', user_id);

  if (error) {
    console.error('Error deleting habit:', error);
    return { success: false, message: 'Error deleting habit', data: error };
  } else {
    //console.log('Habit deleted successfully:', data);
    return { success: true, message: 'Habit deleted successfully', data };
  }
};
  


  //** Getter method to retrieve all of user's habits.
   /* 
   * @param userId 
   * @returns array of Habit objects
   */
  export const getUserHabits = async (userId: string): Promise<Habit[]> => {
    const { data, error } = await supabase.from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('order', { ascending: true });
    if (error && userId) {
      console.error('Error fetching habits:', error);
      return [];
    }
    return data as Habit[];
  };

  export const getHabit = async (userId: string,habit_id: string): Promise<Habit | null> => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('id', habit_id)
      .single(); // Ensures only one record is returned
  
    if (error && userId) {
      //console.log('Error fetching habit:', error);
      return null;
    }
  
    return data as Habit;
    
  };

//Defining the types for handling habit changes.
type ChangeHandler = (payload: { eventType: string; new: Habit; old: Habit}) => void;
//** DB Listener. Listens for changes in the Habit table to automatically change the user's homepage.
 /* 
 * @param handleChange 
 * @returns 
 */
export const listenToHabitsTable = (handleChange: ChangeHandler) => {
    
    const subscription = supabase
      .channel('table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
        },
        (payload: any) => {
          const eventType = payload.eventType;
          const newRecord = payload.new as Habit;
          const oldRecord = payload.old as Habit;
          handleChange({ eventType, new: newRecord, old: oldRecord });
        }
      )
      .subscribe();
  
    // Return an unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  };

//Defining the types for handling habit changes.
type HabitTrackingChangeHandler = (payload: { eventType: string; new: HabitTracking; old: HabitTracking}) => void;
//** DB Listener. Listens for changes in the habit_tracking table to automatically change the user's homepage.
 /* 
 * @param handleChange 
 * @returns 
 */
export const listenToHabitTrackingTable = (handleChange: HabitTrackingChangeHandler) => {
    
    const subscription = supabase
      .channel('table_db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_tracking',
        },
        (payload: any) => {
          const eventType = payload.eventType;
          const newRecord = payload.new as HabitTracking;
          const oldRecord = payload.old as HabitTracking;
          handleChange({ eventType, new: newRecord, old: oldRecord });
        }
      )
      .subscribe();
  
    // Return an unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  };

//** Getter method to get a user's tracking count for a specific habit in a specific time frame.
 /* 
 * @param habit_id 
 * @param user_id 
 * @param selectedDate (The selected date on the homepage.)
 * @param frequency_rate_int (Time frame represented as an int)
 * @returns 
 */
export const getTrackingCount = async (habit_id: string, user_id: string, date: Date)=>{
  const selectedDate = new Date(date.toDateString())
  //const time_frame_end = getDateAfterTimeFrame(selectedDate, frequency_rate_int);
  const { data: existingTracking, error } = await supabase
    .from('habit_tracking')
    .select('tracking_count')
    .eq('user_id', user_id)
    .eq('habit_id', habit_id)
    .lte('time_frame_start', selectedDate.toISOString())
    .gte('time_frame_end', selectedDate.toISOString());
    if (error && user_id) {
      //console.log('Error fetching habits:', error, habit_id);
      return 0;
    }
    //console.log(existingTracking)
    const totalTrackingCount = existingTracking?.reduce((acc, curr) => acc + curr.tracking_count, 0) || 0;
    //console.log(existingTracking)
  
    return totalTrackingCount;
  };

//** Getter method to retreive the frequency and time frame that user selected for specfic habit.
 /* 
 * @param habit_id 
 * @returns frequency and time frame
 */
export const getHabitFrequency = async (habit_id: string) =>{
  const { data, error } = await supabase.from('habits')
    .select('frequency, frequency_rate_int')
    .eq('id', habit_id);
    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
    //console.log(data)
    return data;

}

/** Helper function to determine end of habit based on date on which user started tracking habit and their selected time frame for habit.
 * 
 * @param date (date on which user started tracking habit.)
 * @param timeFrame (Time frame in which user wants to track habit)
 * @returns 
 */
function getDateAfterTimeFrame(date: Date, timeFrame: number): Date {
  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() + (timeFrame - 1));
  return resultDate;
}

/** Adds a tracking count to a specified habit for a specified time frame.
 * 
 * @param user_id 
 * @param habit_id (specific habit)
 * @param selectedDate (date on which they are tracking)
 * @returns 
 */
export const addTracking = async (user_id: string, habit_id: string, date: Date, newValue?: number) => {
  const frequencies = await getHabitFrequency(habit_id);
  const frequency_rate_int = Number(frequencies[0].frequency_rate_int);
  const frequency = Number(frequencies[0].frequency);
  const selectedDate = new Date(date.toDateString())
  const time_frame_end = getDateAfterTimeFrame(selectedDate, frequency_rate_int);

  // Check if there is already a tracking record for the given user, habit, and time frame
  const { data: existingTracking, error } = await supabase
    .from('habit_tracking')
    .select('id, tracking_count, tracking_goal')
    .eq('user_id', user_id)
    .eq('habit_id', habit_id)
    .lte('time_frame_start', selectedDate.toISOString())
    .gte('time_frame_end', selectedDate.toISOString());

  if (error) {
    //console.log('No tracking data exists', error);
  }

  if (existingTracking && existingTracking.length > 0) {
    // If a record exists, increment the tracking_count
    const trackingId = existingTracking[0].id;
    const tracking_goal = existingTracking[0].tracking_goal;
    const newTrackingCount = existingTracking[0].tracking_count + 1;
    //console.log(newTrackingCount)

    const { data, error: updateError } = await supabase
      .from('habit_tracking')
      .update({ tracking_count: newTrackingCount })
      .eq('id', trackingId)
      .select()

    if (updateError) {
      console.error('Error updating tracking count:', updateError);
      
    }else{
        addTrackingHistory(trackingId, habit_id, selectedDate, user_id)
        return newTrackingCount;
    }
  } else if(newValue !== undefined){
    const newTrackingCount = 1
    const { data, error: insertError } = await supabase
      .from('habit_tracking')
      .insert({
        user_id,
        habit_id,
        time_frame_start: selectedDate,
        time_frame_end,
        tracking_count: newValue, // Start at 1 since this is the first tracking
        tracking_goal: frequency,
        frequency_rate_int: frequency_rate_int
      })
      .select('id');

    if (insertError) {
      //console.error('Error inserting tracking data:', insertError);
    }else{
        const insertedId = data?.[0]?.id
        addTrackingHistory(insertedId, habit_id, selectedDate, user_id)  
        return newTrackingCount;
    }

  }else {
    // If no record exists, insert a new one
    const newTrackingCount = 1
    const { data, error: insertError } = await supabase
      .from('habit_tracking')
      .insert({
        user_id,
        habit_id,
        time_frame_start: selectedDate,
        time_frame_end,
        tracking_count: newTrackingCount, // Start at 1 since this is the first tracking
        tracking_goal: frequency,
        frequency_rate_int: frequency_rate_int
      })
      .select('id');

    if (insertError) {
      //console.error('Error inserting tracking data:', insertError);
    }else{
      const insertedId = data?.[0]?.id
      addTrackingHistory(insertedId, habit_id, selectedDate, user_id)  
      return newTrackingCount;
    }
  }
};


export const addTrackingHistory = async (tracking_id: string, habit_id: string, tracked_habit_date: Date, user_id: string)=>{
    if(tracking_id){
        const {error: insertError} = await supabase
            .from('habit_tracking_history')
            .insert({
                tracking_id: tracking_id,
                habit_id: habit_id,
                tracked_habit_date: tracked_habit_date.toLocaleDateString(),
                user_id: user_id
            })

        if (insertError) {
            console.error('Error inserting tracking history data:', insertError);
        }else{
            //console.log("Habit Tracked in addTrackingHistory.")
        }
        

    }


}

export const removeTracking = async (user_id: string, habit_id: string, date: Date) =>{
  const selectedDate = new Date(date.toDateString())
  const deincrementCount = async ()=>{
    const newValue = await getTrackingCount(habit_id, user_id, selectedDate)
    return newValue - 1
  }
  const newTrackingCount = await deincrementCount()
  //console.log(newTrackingCount)
  

  const { data, error: updateError } = await supabase
  .from("habits_tracking")
  .update({ tracking_count: newTrackingCount })
  .eq('user_id', user_id)
  .eq('habit_id', habit_id)
  .lte('time_frame_start', selectedDate.toISOString())
  .gte('time_frame_end', selectedDate.toISOString());

  if (updateError) {
    //console.error('Error inserting tracking data:', insertError);
  }else{
    return data;
  }

}

export const updateTracking = async (user_id: string, habit_id: string, date: Date, updatedValue: number) => {
  const selectedDate = new Date(date.toDateString())

  // Check if the tracking record exists
  const { data: existingTracking, error: selectError } = await supabase
    .from("habit_tracking")
    .select("id")
    .eq('user_id', user_id)
    .eq('habit_id', habit_id)
    .lte('time_frame_start', selectedDate.toISOString())
    .gte('time_frame_end', selectedDate.toISOString());

  if (selectError) {
    console.error('Error checking existing tracking record:', selectError);
    return;
  }

  if (existingTracking && existingTracking.length > 0) {
    const trackingId = existingTracking[0].id;
    //console.log("TrackingHistoryId:", existingTracking)
    if(updatedValue === 0){
    const { data, error: updateError } = await supabase
      .from("habit_tracking")
      .delete()
      .eq('user_id', user_id)
      .eq('habit_id', habit_id)
      .lte('time_frame_start', selectedDate.toISOString())
      .gte('time_frame_end', selectedDate.toISOString());

      if (updateError) {
        console.error('Error updating tracking data:', updateError);
      } else {
        //console.log("Habit Tracking Updated.");
        return updatedValue;
      }

    }
    else{
    // If the record exists, and new value is not equal to 0 update it
    const { data, error: updateError } = await supabase
      .from("habit_tracking")
      .update({ tracking_count: updatedValue })
      .eq('user_id', user_id)
      .eq('habit_id', habit_id)
      .lte('time_frame_start', selectedDate.toISOString())
      .gte('time_frame_end', selectedDate.toISOString());

    if (updateError) {
      console.error('Error updating tracking data:', updateError);
    } else {
      //console.log("Habit Tracking Updated.");
      addTrackingHistory(trackingId, habit_id, selectedDate, user_id)
      return updatedValue;
    }
    }

  } else {
    // If the record does not exist, call addTracking
    //console.log("Record doesn't exist, adding new tracking record.");
    return await addTracking(user_id, habit_id, selectedDate, updatedValue);
  }
};

export const archiveHabit = async (habit_id: string, userId:string): Promise<{ success: boolean; message: string; data?: any }> =>{
  
  const {data, error} = await supabase
  .from('habits')
  .update({archived: true})
  .eq('user_id', userId)
  .eq('id', habit_id)
  

  if (error) {
    console.error('Error archiving goal:', error);
    return { success: false, message: 'Error archiving goal', data: error };
  } else {
    //console.log('Goal archived successfully:', data);
    return { success: true, message: 'Goal archived successfully', data };
  }
}

export const getUserArchivedHabits= async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', userId)
  .or('archived.eq.true')
  

  if (error && userId) {
    console.error('Error fetching habits:', error);
    return [];
  }
  if(data){
    
    return data as Habit[];
  }else{
    return [];
  }
};