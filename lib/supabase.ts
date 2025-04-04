import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchSupabaseSecrets } from './functions/env_functions';

const supabaseUrl = 'https://eykpncisvbuptalctkjx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxMTQ3MzgsImV4cCI6MjAzNTY5MDczOH0.mULscPjrRARbUp80OnVY_GQGUYMPhG6k-QCvGTZ4k3g'

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
    if (supabaseClient) return supabaseClient;
    
    const secrets = await fetchSupabaseSecrets();

    if (!secrets) {
        console.error("Failed to fetch Supabase secrets");
        return null;
    }

    const { supabaseUrl, supabaseAnonKey } = secrets;

    if (supabaseUrl && supabaseAnonKey) {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                storage: AsyncStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            }
        });
    }

    return null;
}

export const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default client;