import { useGlobalContext } from "@/context/Context";
import {
  registerForPushNotificationsAsync,
  saveNotifications,
  updateUserExpoPushToken,
} from "@/lib/supbase_notifications";
import { getDefaultDateUtcTime } from "@/lib/utils/dateTimeUtils";
import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons"; // for checkmark icon

const EnableNotificationButton = () => {
  const { user, setUser } = useGlobalContext();
  const [enabled, setEnabled] = useState(false);

  const handleEnableNotification = async () => {
    try {
      const token = await registerForPushNotificationsAsync();

      await updateUserExpoPushToken(user.userId, token);

      const defaultTime = getDefaultDateUtcTime();
      await saveNotifications(user.userId, token, defaultTime);

      setUser((prevUser) => ({
        ...prevUser,
        expoPushToken: token,
        notificationTime: defaultTime.toISOString(),
      }));

      setEnabled(true); // mark as enabled
      showToast("enabled");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      showToast("error");
    }
  };

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

    Toast.show({
      type: type === "error" ? "error" : "success",
      text1: type === "error" ? "Error!" : "Success!",
      text2: message,
      visibilityTime: 1500,
      position: "top",
      autoHide: true,
    });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.enableButton, enabled && styles.enabledStyle]}
        onPress={handleEnableNotification}
        disabled={enabled}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.buttonText, enabled && styles.enabledText]}>
            {enabled
              ? "Notifications Enabled"
              : "Click to Enable Notifications"}
          </Text>
          {enabled && (
            <Feather
              name="check"
              size={20}
              color="green"
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  enableButton: {
    backgroundColor: "#3e4e88",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  enabledStyle: {
    backgroundColor: "#ffffff",
    borderColor: "#3e4e88",
    borderWidth: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  enabledText: {
    color: "grey",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default EnableNotificationButton;
