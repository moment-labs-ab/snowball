import { Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import { User } from '@/types/types'
import { useSupabaseClient } from './supabase';
import { getDateISOStringFromUtcTimeString, getDefaultDateISOStringFromUtcTimeString } from './utils/dateTimeUtils';

type UserProfileData = {
    username?: string | null;
    premium_user?: boolean | null;
    full_name?: string | null;
    expo_push_token?: string | null;
    notification_time?: string | null;
    [key: string]: unknown;
};

/**
 * Allows users to sign up with an email
 * @param email The users email
 * @param password Users password
 * @param username User's selected username
 * @returns The newly created session of the user.
 */
export const signUpWithEmail = async function signUpWithEmail(email: string, password: string, name: string, username: string): Promise<User | null> {
    const client = useSupabaseClient();

    // TODO: Check for duplicate emails
    const { data: { session }, error } = await client.auth.signUp({
        email: email,
        password: password,
    });

    if (error || !session?.user) {
        Alert.alert("Unable to Signup:", error?.message);
        return null;
    }

    // TODO: Check for duplicate usernames
    const { error: upsertError } = await client.from('profiles')
        .upsert({ id: session?.user.id, full_name: name }).select();

    if (upsertError) {
        Alert.alert("Error creating user profile");
        return null;
    }

    await trackLogin(session.user.id)

    return {
        userId: session?.user.id,
        name: name,
        username: username,
        email: email,
        premiumUser: false
    } as User;
}

/**
 * Allows users to reset password with email
 * @param email The users email
 */
export const sendResetPasswordEmail = async (email: string) => {
    const client = useSupabaseClient();

    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.momentlabs.snowball://reset-password'//Linking.createURL("/reset-password") //exp://10.0.0.201:8081/--/reset-password
    });

    if (error) Alert.alert(error.message);
}

/**
 * Allows users to reset password with email
 * @param email The users email
 * @param accessToken The token recived from the email
 */
export const resetPassword = async (
    email: string,
    accessToken: string,
    newPassword: string
) => {
    const client = useSupabaseClient();

    const { data, error: sessionError } = await client.auth.verifyOtp({
        email,
        token: accessToken,
        type: "recovery",
    });

    if (sessionError) {
        return Alert.alert("Unable to Reset Password", sessionError.message);
    }

    if (!data.session) {
        return Alert.alert("Unable to Reset Password", "Invalid session data.");
    }

    const { error: setSessionError } = await client.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    });

    if (setSessionError) {
        return Alert.alert("Unable to Reset Password", setSessionError.message);
    }

    const { error: updateError } = await client.auth.updateUser({
        password: newPassword,
    });

    if (updateError) {
        return Alert.alert("Unable to Reset Password", updateError.message);
    }

    Alert.alert("Password Reset!", "Please login with your new password.");
};

/**
 * Allows a user to sign in with an email and password
 * @param email Users email
 * @param password Users password
 * @returns the users data.
 */
export const signInWithEmail = async function signInWithEmail(email: string, password: string) {
    const client = useSupabaseClient();

    const { error } = await client.auth.signInWithPassword({
        email: email,
        password: password,
    })

    if (error) {
        Alert.alert(error.message)
        return null
    }

    const { data: { user } } = await client.auth.getUser()
    if (user) {
        await trackLogin(user.id)
    }
    return user
}

/**
 * Combined getter method to fetch multiple user profile fields based on userId.
 * @param userId User's ID
 * @param fields Optional array of specific fields to return (returns all fields if not specified)
 * @returns Object containing requested user profile fields or undefined if error occurs
 */
export const getUserProfile = async (userId: string, fields?: string[]): Promise<UserProfileData | null> => {
    const client = useSupabaseClient();
    
    // Define default fields to fetch if not specified
    const fieldsToFetch = fields || ['username', 'premium_user', 'full_name', 'expo_push_token', 'notification_time'];
    
    try {
        const { data, error } = await client
            .from('profiles')
            .select(fieldsToFetch.join(','))
            .eq('id', userId)
            .single();
            
        if (error) {
            return null;
        }

        return data as unknown as UserProfileData;
    } catch (error) {
        console.error("Exception when fetching user profile:", error);
        return null;
    }
}

//**
/* Gets the current user on the app.
* @returns current_user data 
*/
export const getCurrentUser = async (): Promise<User | null> => {
    const client = useSupabaseClient();

    try {
        const { data, error } = await client.auth.getUser();
        if (error || !data?.user) {
            return null;
        }

        const profile = await getUserProfile(data.user.id);

        const currentUser = {
            userId: data.user.id,
            username: profile?.username || "",
            email: data.user.email || "",
            premiumUser: profile?.premium_user || false,
            name: profile?.full_name || "",
            expoPushToken: profile?.expo_push_token || "",
            notificationTime: profile?.notification_time ? getDateISOStringFromUtcTimeString(profile.notification_time) :
                getDefaultDateISOStringFromUtcTimeString()
        } as User;

        return currentUser;
    } catch {
        return null;
    }
};

//** Refreshs the current users session.
/* 
* @returns 
*/
export const refreshUserSession = async () => {
    const client = useSupabaseClient();

    try {
        const { data: {
            session
        } } = await client.auth.refreshSession()
        if (!session) {
            Alert.alert("User not found.")
        } else {
            return session

        }
    } catch {

    }
}


//**
/* Signs a user out.
*/
export const signOut = async (): Promise<{ success: boolean; message: string; data?: any }> => {
    const client = useSupabaseClient();

    const { error } = await client.auth.signOut()

    if (error) {
        console.error('Error signing user out:', error);
        return { success: false, message: 'Error signing user out' };
    } else {
        //console.log('User signed out successfully:');
        return { success: true, message: 'User signed out successfully' };
    }

}


// This functionality needs to be handled on server. We could use Supabase edge function for now for this.
export const handleUserDeletion = async (user_id: string): Promise<{ success: boolean; message: string; data?: any }> => {
    const client = useSupabaseClient();

    try {
        const { data, error } = await client.functions.invoke("delete_user", {
            body: { user_id: user_id },
            method: "DELETE"
        })

        if (error) {
            console.error('Error Deleting User:', error)
            return {
                success: false,
                message: `Error deleting user: ${error.message}`
            }
        }

        return {
            success: true,
            message: 'User and associated data deleted successfully',
            data
        }
    } catch (error) {
        console.error('Unexpected error during user deletion:', error)
        return {
            success: false,
            message: 'Unexpected error occurred during deletion'
        }
    }
}

export const trackLogin = async (userId: string) => {
    const client = useSupabaseClient();

    if (!userId) return;
    try {
        await client
            .from('user_logins')
            .insert([{ user_id: userId }]);
    } catch (error) {
        console.error("Error logging login event:", error);
    }
};
