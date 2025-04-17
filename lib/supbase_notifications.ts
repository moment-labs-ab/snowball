import { Alert, AppState, Linking } from 'react-native'
import 'react-native-url-polyfill/auto'
import { NotificationItem } from '@/types/types'
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from 'expo-constants';
import { Platform } from "react-native";
import { useSupabaseClient } from './supabase';

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
    const client = useSupabaseClient();

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
    catch {
        return []

    }
}

export const saveNotifications = async (userId: string, pushToken: string, notificationTime: Date) => {
    const client = useSupabaseClient();

    const notificationTimeString = notificationTime.toISOString();
    try {
        // Check if the user already exists in the table
        const { error } = await client
            .from("profiles")
            .update({ notification_time: notificationTimeString})
            .eq("id", userId);

        if (error) {
            console.error("Error updating notification time:", error.message);
            return error.message;
        }
        return true;
    } catch (error) {
        console.error("Unexpected error saving notifications:", error);
    }
};


export const updateUserExpoPushToken = async (userId: string, pushToken: string | null) => {
    const client = useSupabaseClient();

    try {
        const { error } = await client
            .from("profiles")
            .update({ expo_push_token: pushToken })
            .eq('id', userId)

    } catch (error) {
        console.error("Error inserting Expo Push Token", error)

    }

}

export const getExpoPushToken = async (userId: string) => {
    const client = useSupabaseClient();

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

export async function checkUpdate(updatedDate: string) {
    const client = useSupabaseClient();

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
        await Notifications.setNotificationChannelAsync('default', {
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
        token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants?.expoConfig?.extra?.eas.projectId,
        });
        console.log(token);

    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token?.data ?? "";
}

export async function unregisterForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.deleteNotificationChannelAsync('default');
    }

    if (Device.isDevice) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        const status = await Notifications.getPermissionsAsync();

    } else {
        alert("Must use physical device for Push Notifications");
    }
}

export const showPermissionRequiredAlert = () => {
    Alert.alert(
      "Notifications Permission Required",
      "To receive notifications, you need to enable them in your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open Settings", 
          onPress: openSettings
        }
      ]
    );
  };

const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

/**
 * This function is only optimized for mobile devices
 * @returns 
 */
export async function isNotificationsEnabled() {
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        return existingStatus === "granted";
    } else {
        return false;
    }
}

