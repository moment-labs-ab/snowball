import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchSupabaseSecrets } from './functions/env_functions';

const supabaseUrl = 'https://eykpncisvbuptalctkjx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxMTQ3MzgsImV4cCI6MjAzNTY5MDczOH0.mULscPjrRARbUp80OnVY_GQGUYMPhG6k-QCvGTZ4k3g'

let supabaseClient: SupabaseClient | null = null;

export const initSupabaseClient = async() => {
    if (supabaseClient) {
        return;
    }

    const secrets = await fetchSupabaseSecrets();

    if (!secrets) {
        console.error("Failed to fetch Supabase secrets");
        throw new Error("Supabase secrets not available");
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
}

export const useSupabaseClient = () => {
    try {
    if (!supabaseClient) {
        throw new Error("Supabase client not initialized. Call initSupabaseClient() first.");
    }
    return supabaseClient;

    } catch (err) {
      console.warn("Supabase client not initialized yet.");
      throw err;
    }
}

export const resetSupabaseClient = () => {
    supabaseClient = null;
};