import { AppState, Alert } from 'react-native'
import 'react-native-url-polyfill/auto'
import { Session } from '@supabase/supabase-js'
import { useState } from 'react'
import { nanoid } from 'nanoid';
import { User } from '@/types/types'
import client from './supabase'

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    client.auth.startAutoRefresh()
  } else {
    client.auth.stopAutoRefresh()
  }
})

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
export const signUpWithEmail = async function signUpWithEmail(email: string, password: string, name: string, username:string): Promise<User | null> {
    
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
    const {data, error: upsertError } = await client.from('profiles')
        .upsert({id: session?.user.id, full_name: name}).select();
    
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
export const sendResetPasswordEmail = async (email: string) =>{
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
export const signInWithEmail = async function signInWithEmail(email:string, password:string) {
    const { error } = await client.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)

    const { data: { user } } = await client.auth.getUser()
    if(user){
      trackLogin(user.id)
    }
    return user
  }

//**
/* Getter method to get user's username base on their userId.
* @param userId 
* @returns 
*/
export const getUsername = async (userId: string) =>{
    try {
      const { data, error } = await client
      .from('profiles')
      .select(`username`)
      .eq('id', userId)
      if(data){
        return(data[0].username)
      }
      
    } catch (error) {
      return(undefined)
      
    }
}

export const getPremiumStatus = async (userId: string) =>{
    try {
        const { data, error } = await client
        .from('profiles')
        .select(`premium_user`)
        .eq('id', userId)
        if(data){
        return(data[0].premium_user)
        }
        
    } catch (error) {
        //console.log("There was an error trying to query users' premium user status")
        return(undefined)
        
    }
}

export const getName = async (userId: string) =>{
    try {
        const { data, error } = await client
        .from('profiles')
        .select(`full_name`)
        .eq('id', userId)
        if(data){
        return(data[0].full_name)
        }
        
    } catch (error) {
        //console.log("There was an error trying to query user's name")
        return(undefined)
    }
}

//**
 /* Gets the current user on the app.
 * @returns current_user data 
 */
 export const getCurrentUser = async (): Promise<User> => {
    try {
        const { data } = await client.auth.getUser();
        if (!data) {
            Alert.alert("User data not found");
            let defaultUser = {
                userId: "",
                username: "",
                name: "",
                email: "",
                premiumUser: false
            } as User;
            
            return defaultUser;
        } else {

            // TODO: This needs to be refactored into one call.
            const userId = data.user?.id || "";
            const username = await getUsername(userId);
            const premiumUser = await getPremiumStatus(userId);
            const name = await getName(userId);

            let currentUser = {
                userId: userId,
                username: username,
                email: data.user?.email || "",
                premiumUser: premiumUser,
                name: name
            } as User;

            return currentUser;
        }
    } catch (error) {
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
  export const refreshUserSession = async () =>{
    try {
      const { data:{
        session
      }, error } = await client.auth.refreshSession()
      if(!session){
        Alert.alert("User not found.")
      }else{
        return session

      }
    } catch (error) {
      
    }
  }


  //**
   /* Signs a user out.
   */
export const signOut = async (): Promise<{ success: boolean; message: string; data?: any }> =>{
      const { error } = await client.auth.signOut()

      if (error) {
        console.error('Error signing user out:', error);
        return { success: false, message: 'Error signing user out'};
      } else {
        //console.log('User signed out successfully:');
        return { success: true, message: 'User signed out successfully'};
      }
    
  }


  // This functionality needs to be handled on server. We could use Supabase edge function for now for this.
  export const handleUserDeletion = async(user_id: string): Promise<{ success: boolean; message: string; data?: any }> => {
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
  const now = new Date().toDateString()
    try {
      await client
        .from('user_logins')
        .insert([{ user_id: userId}]);
    } catch (error) {
      console.error("Error logging login event:", error);
    }
  };





  
