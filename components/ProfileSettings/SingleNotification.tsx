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
import { getDefaultDateUtcTime } from "@/lib/utils/dateTimeUtils";
import Feather from "@expo/vector-icons/Feather";


const SingleNotificationPage = () => {
    const { user, setUser } = useGlobalContext();

    const [notificationsGranted, setNotificationsGranted] = useState(false);
    const [expoPushToken, setExpoPushToken] = useState("");
    const [notificationTime, setNotificationTime] = useState(new Date());
    const [originalTime, setOriginalTime] = useState<Date>(new Date(user.notificationTime || ""));
    const [timeChanged, setTimeChanged] = useState(false);

    // Run once on mount and when user changes
    useEffect(() => {
        const fetchNotificationStatus = async () => {
            try {
                const status = await isNotificationsEnabled();
                const tokenConfirmed = status && user.expoPushToken != null && user.expoPushToken !== "";
                setNotificationsGranted(tokenConfirmed);
                
                if (tokenConfirmed) {
                    setExpoPushToken(user.expoPushToken!);
                    
                    // Set notification time from user settings if available
                    if (user.notificationTime) {
                        const savedTime = new Date(user.notificationTime);

                        setNotificationTime(savedTime);
                        setOriginalTime(savedTime);
                    } else {
                        setDefaultNotificationTime(); 
                    }
                }
            } catch (error) {
                console.error("Error fetching notification status:", error);
            }
        };
        
        fetchNotificationStatus();
    }, [user]);

    const setDefaultNotificationTime = () => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);

        setNotificationTime(date);
        setOriginalTime(date);
    }

    // Helper function to set time to the top of the hour
    const setToTopOfHour = (date: Date ) => {
        const newDate = new Date(date);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate;
    };
    
    // Called when user selects a time from the picker
    const handleTimeSelected = (time: Date) => {
        setNotificationTime(time);
        // Check if time has changed from original
        setTimeChanged(originalTime && 
            (time.getHours() !== originalTime.getHours() || 
             time.getMinutes() !== originalTime.getMinutes()));
    };

    // Called when user taps "Enable Notifications"
    const handleEnableNotification = async () => {
        try {
            const token = await registerForPushNotificationsAsync();
            if (!token) {
                showToast("error");
                return;
            }
            
            const defaultDate = getDefaultDateUtcTime();
            
            // Save token and notification time
            await updateUserExpoPushToken(user.userId, token);
            await saveNotifications(user.userId, token, defaultDate);
            
            // Update local user state
            setUser((prevUser) => ({
                ...prevUser,
                expoPushToken: token,
                notificationTime: defaultDate.toISOString()
            }));
            
            setExpoPushToken(token);
            setOriginalTime(defaultDate);
            setNotificationTime(defaultDate);
            setTimeChanged(false);
            setNotificationsGranted(true);
            showToast("enabled");
        } catch (error) {
            console.error("Error enabling notifications:", error);
            showToast("error");
        }
    };

    // Called when user taps "Disable Notifications"
    const handleDisableNotification = async () => {
        try {
            // Clear the token in database
            await updateUserExpoPushToken(user.userId, "");
            await saveNotifications(user.userId, "", null);
            
            setDefaultNotificationTime(); // Reset to default time
            
            // Update local user state
            setUser((prevUser) => ({
                ...prevUser,
                notificationTime: "",
                expoPushToken: ""
            }));
            
            setExpoPushToken("");
            setNotificationsGranted(false);
            showToast("disabled");
        } catch (error) {
            console.error("Error disabling notifications:", error);
            showToast("disabled");
        }
    };

    // Called when user taps "Update Time"
    const handleUpdateNotification = async () => {
        try {
            await saveNotifications(user.userId, expoPushToken, notificationTime);
            
            // Update local user state
            setUser((prevUser) => ({
                ...prevUser,
                notificationTime: notificationTime.toISOString()
            }));
            
            setOriginalTime(notificationTime);
            setTimeChanged(false);
            showToast("success");
        } catch (error) {
            console.error("Error updating notification time:", error);
            showToast("disabled"); //Update
        }
    };

    // Show various toast messages
    const showToast = (type: "success" | "disabled" | "enabled" | "error") => {        
        let message;
        switch (type) {
            case "success":
                message = "Notifications updated successfully.";
                break;
            case "disabled":
                message = "Notifications disabled successfully.";
                break;
            case "enabled":
                message = "Notifications enabled successfully.";
                break;
            case "error":
                message = "An error occurred while processing your request.";
                break;
            default:
                message = "Unknown action.";
        }
        
        let toastOptions = {
            type: type === "error" ? "error" : "success",
            text1: type === "error" ? "Error!" : "Success!",
            text2: message,
            visibilityTime: 1500,
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

                    {timeChanged && (
                        <TouchableOpacity style={styles.enableButton} onPress={handleUpdateNotification}>
                            <Text style={styles.buttonText}>Update Notification Time</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.disableButton} onPress={handleDisableNotification}>
                        <Text style={styles.buttonText}>Disable Notifications</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                <View style={styles.iconWrapper}>
        <Feather name="bell" size={24} color="#3e4e88" />
      </View>
                    <Text style={styles.notificationsText}>
                        Enable notifications to receive a reminder once a day.
                    </Text>

                    <TouchableOpacity style={styles.enableButton} onPress={handleEnableNotification}>
                        <Text style={styles.buttonText}>Enable Notifications</Text>
                    </TouchableOpacity>
                </>
            )}

            <Toast />
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
    iconWrapper: {
        width: 48,
        height: 48,
        marginBottom: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderRadius: 50,
        backgroundColor: "#F5F7FF",
        alignSelf:'center'
      },
});