import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, Session } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid';


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

// Function to generate a unique ID
function generateUniqueId(): string {
  const id = nanoid();
  return id
}


export const signUpWithEmail = async function signUpWithEmail(email: string, password: string, username:string) {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)

    console.log(session?.user)
    await supabase.from('profiles').upsert({id: session?.user.id, username: username})

    return session?.user
  }


export const signInWithEmail = async function signInWithEmail(email:string, password:string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)

    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  export const getProfile = async function getProfile(session: Session) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  export const updateProfile = async function updateProfile(
    username: string,
    session?: Session,
    website?: string,
    avatar_url?: string
  ) {
    const [loading, setLoading] = useState(true)
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  export const getUsername = async (userId: string) =>{

    try {
      const { data, error } = await supabase
      .from('profiles')
      .select(`username`)
      .eq('id', userId)
      if(data){
        return(data[0].username)
      }
      
    } catch (error) {
      console.log("There was an error trying to query users' username")
      return(undefined)
      
    }
  }

export const getCurrentUser = async () =>{
  try {
    const {data} = await supabase.auth.getUser()
    if(!data){
      Alert.alert("User data not found")
    }else{
      let username: string
      let userId: string
      let email: string
      userId = data.user?.id || ''
      email = data.user?.email || ''
      username = await getUsername(userId);

      type currentUserType = {
        username?: string,
        email:string,
        userId: string
      }
      let current_user: currentUserType;
      current_user = {
        username: username,
        email: email,
        userId: userId
      }
      return current_user

    }
    
  } catch (error) {
    Alert.alert("Issue fetching current user info.")
    
  }
}

  export const refreshUserSession = async () =>{
    try {
      const { data:{
        session
      }, error } = await supabase.auth.refreshSession()
      if(!session){
        Alert.alert("User not found.")
      }else{
        return session

      }
    } catch (error) {
      
    }
  }

  export const signOut = async () =>{
      const { error } = await supabase.auth.signOut()
    
  }

  export const insertHabit = async (
    user_id: string,
    name: string,
    reminder: boolean,
    frequency: number,
    frequency_rate: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    if(name === 'Habit' || frequency === 0){
      return { success: false, message: 'Please fill both name and frequency fields', data: undefined }; 
  }
  else{
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
          reminder
        },
      ]);
  
    if (error) {
      console.error('Error inserting habit:', error);
      return { success: false, message: 'Error inserting habit', data: error };
    } else {
      console.log('Habit inserted successfully:', data);
      return { success: true, message: 'Habit inserted successfully', data };
    }
  }
}
  
  interface Habit {
    id: string;
    created_at: string;
    user_id: string;
    name: string;
    frequency: string;
    frequency_rate: number;
    reminder: boolean;
  }

  
  
  export const getUserHabits = async (userId: string) =>{
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }