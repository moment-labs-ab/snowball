import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import { NotificationItem } from '@/types/types'
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from 'expo-constants';
import { Platform } from "react-native";
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

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
    try {
      const { data, error } = await client
        .from('user_notifications')
        .select('id, label, time, expo_push_token') // Only fetch count without data
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

export const saveNotifications = async (userId: string, pushToken: string) => {
  try {
    // Check if the user already exists in the table
    const { data, error: fetchError } = await client
      .from("user_notifications")
      .select("user_id")
      .eq("user_id", userId)
      .single(); // Expecting only one record

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "PGRST116" (no rows found), but handle other errors
      console.error("Error checking existing notifications:", fetchError);
      return;
    }

    if (data) {
      // User already exists, no need to insert
      return;
    }

    // Insert new record
    const { error: insertError } = await client.from("user_notifications").insert({
      user_id: userId,
      expo_push_token: pushToken,
    });

    if (insertError) {
      console.error("Error saving notifications:", insertError);
    }
  } catch (error) {
    console.error("Unexpected error saving notifications:", error);
  }
};


export const updateUserExpoPushToken = async (userId: string, pushToken:string)=>{
  try{
    const {error} = await client
    .from("user_notifications")
    .insert({expo_push_token: pushToken})
    .eq('user_id', userId)

  }catch(error){
    console.error("Error inserting Expo Push Token", error)

  }

}

export const getExpoPushToken = async (userId: string) => {
  try {
    const { data, error } = await client
      .from("user_notifications")
      .select("expo_push_token")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching Expo Push Token:", error.message);
      return null;
    }

    return data[0].expo_push_token; // Return just the token, not the whole object
  } catch (err) {
    console.error("Unexpected error fetching Expo Push Token:", err);
    return null;
  }
};



//APPLE & EXPO Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Snowball',
    body: 'This is a test!  ❄️',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

export async function checkUpdate(updatedDate: string){
  const userIds = ['7a6e684a-f2f3-4a1e-b10b-0b3701ace42c']
  const { error: updateError } = await client
  .from("user_notifications")
  .update({ last_updated: updatedDate })
  .in("user_id", userIds); // Batch update

}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  let token
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return "";
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas.projectId,
    });
    //console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token?.data ?? "";
}

