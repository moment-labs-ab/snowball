import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useGlobalContext } from "@/context/Context";
import {
  getExpoPushToken,
  getNotifications,
  saveNotifications,
  updateUserExpoPushToken,
} from "@/lib/supbase_notifications";
import Toast from "react-native-toast-message";
import {
  registerForPushNotificationsAsync,
  sendPushNotification,
} from "@/lib/supbase_notifications";

interface NotificationItem {
  id: number;
  label: string;
  time: string;
  expo_push_token: string;
}

const SingleNotificationPage = () => {
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [timePicker, setTimePicker] = useState(new Date());
  const [expoPushToken, setExpoPushToken] = useState("");

  const handleSave = async (
    userId: string,
    notifications: NotificationItem[]
  ) => {
    //console.log(notifications)
    await saveNotifications(user.userId, expoPushToken);
  };

  const handleSubmit = () => {
    handleSave(user.userId, notifications);
    showToast();

    //console.log(notifications[0].time);
  };

  const showToast = () => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "Notifications updated.",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
          //console.log("Premium Requested!");
        }, // Navigate to your premium page
      },
    });
  };
  const handleTokenRegistration = async () => {
    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token);

      //updateUserExpoPushToken(user.userId, token)
    });
  };

  useEffect(() => {
    handleTokenRegistration();

    //getNotifications(user.userId).then(setNotifications);
  }, [user]);

  return (
    <View style={{ padding: 20, paddingVertical: 40 }}>
      <Text
        style={{
          fontSize: 20,
          color: "#555",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Notifications are a great way to stay on track. We'll send you one once
        in the evenings to remind you.
      </Text>

      <TouchableOpacity style={[styles.submitButton]} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enable Notifications</Text>
      </TouchableOpacity>
      {expoPushToken !== "" && (
        <Button
          title="Press for Sample Notification"
          onPress={async () => {
            sendPushNotification(expoPushToken);
          }}
        />
      )}
      <Toast />
    </View>
  );
};

export default SingleNotificationPage;

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: "#3e4e88",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
