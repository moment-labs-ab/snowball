import { useGlobalContext } from '@/context/Context';
import { registerForPushNotificationsAsync, saveNotifications, updateUserExpoPushToken } from '@/lib/supbase_notifications';
import { getDefaultDateUtcTime } from '@/lib/utils/dateTimeUtils';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Toast from "react-native-toast-message";

/**
 * A reusable notification button component for React Native
 */
const EnableNotificationButton = ({ }) => {
    const { user, setUser } = useGlobalContext();

    const handleEnableNotification = async () => {
        try {
            const token = await registerForPushNotificationsAsync();

            // Save token and notification time
            await updateUserExpoPushToken(user.userId, token);

            const defaultTime = getDefaultDateUtcTime();
            await saveNotifications(user.userId, token, defaultTime);

            // Update local user state
            setUser((prevUser) => ({
                ...prevUser,
                expoPushToken: token,
                notificationTime: defaultTime.toISOString()
            }));

            showToast("enabled");
        } catch (error) {
            console.error("Error enabling notifications:", error);
            showToast("disabled");
        }
    };

    // This could probably be moved to a separate utility file if needed in multiple places
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
        <>
            <TouchableOpacity
                style={[styles.enableButton]}
                onPress={handleEnableNotification}
            >
                <Text style={[styles.buttonText]}> Enable Notifications </Text>
            </TouchableOpacity>

            <Toast/>
        </>
    );
};

const styles = StyleSheet.create({
    enableButton: {
        backgroundColor: "#3e4e88",
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

export default EnableNotificationButton;