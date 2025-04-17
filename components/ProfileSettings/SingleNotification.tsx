import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import { useGlobalContext } from "@/context/Context";
import {
    isNotificationsEnabled,
    saveNotifications,
    registerForPushNotificationsAsync,
    updateUserExpoPushToken,
} from "@/lib/supbase_notifications";
import TimePicker from "../shared/TimePicker";

const SingleNotificationPage = () => {
    const { user, setUser } = useGlobalContext();

    const [notificationsGranted, setNotificationsGranted] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState("");
    const [notificationTime, setNotificationTime] = useState(new Date());

    // Run once on mount and when user changes
    useEffect(() => {
        const fetchNotificationStatus = async () => {
            const status = await isNotificationsEnabled();
            const tokenConfirmed = status && user.expoPushToken !== "" || user.expoPushToken !== null;
            setNotificationsGranted(tokenConfirmed);
        };
        fetchNotificationStatus();

    }, [user]);

    // Called when user selects a time from the picker
    const handleTimeSelected = (time: Date) => {
        setNotificationTime(time);
        console.log("Time selected:", time);
    };

    // Called when user taps "Enable Notifications"
    const handleEnableNotification = async () => {
        const token = await registerForPushNotificationsAsync();
        await updateUserExpoPushToken(user.userId, token);

        setUser((prevUser)=> ({
            ...prevUser,
            expoPushToken: token
        }))

        showToast("enabled");
    };

    // Called when user taps "Update Time"
    const handleDisableNotification = async () => {
        //await saveNotifications(user.userId, expoPushToken);
        showToast("success");
    };

    // Called when user taps "Update Time"
    const handleUpdateNotification = async () => {
        await saveNotifications(user.userId, expoPushToken, notificationTime);
        showToast("success");
    };

    // Show various toast messages
    const showToast = (type: "success" | "disabled" | "enabled") => {
        let toastOptions = {
            type: type === "enabled" ? "error" : "success",
            text1: type === "success" ? "Success!" : "Error!",
            text2:
                type === "success"
                    ? "Notifications updated."
                    : type === "disabled"
                        ? "Notifications turned off."
                        : "Something went wrong.",
            visibilityTime: 3200,
            position: "top" as const,
            autoHide: true,
            props: {
                onPress: () => {
                    // Optional: navigate somewhere
                },
            },
        };

        Toast.show(toastOptions);
    };

    return (
        <View style={styles.container}>
            {notificationsGranted ? (
                <>
                    <Text style={styles.notificationsText}>
                        Choose a time for your daily notification.
                    </Text>

                    <TimePicker
                        label="Notification Time"
                        initialTime={notificationTime}
                        onTimeSelected={handleTimeSelected}
                    />

                    <TouchableOpacity style={styles.enableButton} onPress={handleUpdateNotification}>
                        <Text style={styles.buttonText}>Update Notification Time</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.disableButton} onPress={handleUpdateNotification}>
                        <Text style={styles.buttonText}>Disable Notifications</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.notificationsText}>
                        Notifications are a great way to stay on track.
                    </Text>
                    <Text style={styles.notificationsText}>
                        Enable notifications to receive a reminder once a day.
                    </Text>

                    <TouchableOpacity style={styles.enableButton} onPress={handleEnableNotification}>
                        <Text style={styles.buttonText}>Enable Notifications</Text>
                    </TouchableOpacity>
                </>
            )}

            <Toast />

            {/* Debug buttons */}
            {/* 
      {expoPushToken !== "" && (
        <Button
          title="Send Test Notification"
          onPress={async () => {
            sendPushNotification(expoPushToken);
          }}
        />
      )}
      <Button
        title="Force Update Check"
        onPress={async () => {
          const nowUtc = new Date().toISOString();
          checkUpdate(nowUtc);
        }}
      />
      */}
        </View>
    );
};

export default SingleNotificationPage;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingVertical: 40,
    },
    notificationsText: {
        fontSize: 20,
        color: "#555",
        marginBottom: 20,
        textAlign: "center",
    },
    enableButton: {
        backgroundColor: "#3e4e88",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 15,
        width: "100%",
    },
    disableButton: {
        backgroundColor: "#ff4444",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 15,
        width: "100%",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});