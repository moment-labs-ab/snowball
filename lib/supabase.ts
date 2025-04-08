
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

let supabaseClient: SupabaseClient | null = null;

export const initSupabaseClient = async() => {
    if (supabaseClient) {
        return;
    }
    const SNOWBALL_DB_URL = process.env.SNOWBALL_DB_URL || '';
    const SNOWBALL_DB_ANON_KEY = process.env.SNOWBALL_DB_ANON_KEY || '';

    supabaseClient = createClient(SNOWBALL_DB_URL, SNOWBALL_DB_ANON_KEY, {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        }
    });

    if (supabaseClient) {
        registerSupabaseListeners();
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

const registerSupabaseListeners = () => {
    // Tells Supabase Auth to continuously refresh the session automatically
    // if the app is in the foreground. When this is added, you will continue
    // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
    // `SIGNED_OUT` event if the user's session is terminated. This should
    // only be registered once.
    AppState.addEventListener('change', (state) => {

        if (state === 'active') {
            supabaseClient?.auth.startAutoRefresh()
        } else {
            supabaseClient?.auth.stopAutoRefresh()
        }
    });
}

