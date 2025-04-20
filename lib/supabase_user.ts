import { Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import { nanoid } from 'nanoid';
import { User } from '@/types/types'
import { useSupabaseClient } from './supabase';
import { getDateISOStringFromUtcTimeString, getMidnightISOString } from './utils/dateTimeUtils';

// Function to generate a unique ID
function generateUniqueId(): string {
    const id = nanoid();
    return id
}

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
    const { data, error: upsertError } = await client.from('profiles')
        .upsert({ id: session?.user.id, full_name: name }).select();

    if (upsertError) {
        Alert.alert("Error creating user profile");
        return null;
    }

    trackLogin(session.user.id)

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

    const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.momentlabs.snowball://reset-password' //exp://10.0.0.201:8081/--/reset-password
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

    if (error) Alert.alert(error.message)

    const { data: { user } } = await client.auth.getUser()
    if (user) {
        trackLogin(user.id)
    }
    return user
}

/**
 * Combined getter method to fetch multiple user profile fields based on userId.
 * @param userId User's ID
 * @param fields Optional array of specific fields to return (returns all fields if not specified)
 * @returns Object containing requested user profile fields or undefined if error occurs
 */
export const getUserProfile = async (userId: string, fields?: string[]) => {
    const client = useSupabaseClient();
    
    // Define default fields to fetch if not specified
    const fieldsToFetch = fields || ['username', 'premium_user', 'full_name', 'expo_push_token', 'notification_time'];
    
    try {
        const { data, error } = await client
            .from('profiles')
            .select(fieldsToFetch.join(','))
            .eq('id', userId)
            .select();
            
        if (error) {
            console.error("Error fetching user profile:", error);
            return undefined;
        }

        return data[0];
    } catch (error) {
        console.error("Exception when fetching user profile:", error);
        return undefined;
    }
}

//**
/* Gets the current user on the app.
* @returns current_user data 
*/
export const getCurrentUser = async (): Promise<User> => {
    const client = useSupabaseClient();

    try {
        //console.log("Fetching current user data...");
        const { data } = await client.auth.getUser();
        if (!data) {
            Alert.alert("User data not found");
            let defaultUser = {
                userId: "",
                username: "",
                name: "",
                email: "",
                premiumUser: false,
                expoPushToken: "",
                notificationTime: ""
            } as User;

            return defaultUser;
        } else {

            const profile = await getUserProfile(data.user?.id || "");

            let currentUser = {
                userId: data.user?.id || "",
                username: profile.username || "",
                email: data.user?.email || "",
                premiumUser: profile.premium_user || false,
                name: profile.full_name || "",
                expoPushToken: profile.expo_push_token || "",
                notificationTime: profile.notification_time ? getDateISOStringFromUtcTimeString(profile.notification_time) : null
            } as User;

            return currentUser;
        }
    } catch (error) {
        //console.log("Error fetching current user info:", error);
        Alert.alert("Issue fetching current user info.");
        let defaultUser = {
            userId: "",
            username: "",
            name: "",
            email: "",
            premiumUser: false
        } as User;

        return defaultUser;
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
        }, error } = await client.auth.refreshSession()
        if (!session) {
            Alert.alert("User not found.")
        } else {
            return session

        }
    } catch (error) {

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
        // Delete user using admin client
        const { data, error } = await client.auth.admin.deleteUser(user_id)

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

    const now = new Date().toDateString()
    try {
        await client
            .from('user_logins')
            .insert([{ user_id: userId }]);
    } catch (error) {
        console.error("Error logging login event:", error);
    }
};






