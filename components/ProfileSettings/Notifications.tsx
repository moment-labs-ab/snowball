import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView
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
import { registerForPushNotificationsAsync, sendPushNotification } from "@/lib/supbase_notifications";


interface NotificationItem {
  id: number;
  label: string;
  time: string;
  expo_push_token:string
}

const NotificationSettings = () => {
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [timePicker, setTimePicker] = useState(new Date());
  const [expoPushToken, setExpoPushToken] = useState("");

  const addNotification = () => {
    const maxNotifications = user.premiumUser ? 6 : 3;
  
    if (notifications.length < maxNotifications) {
      setNotifications([
        ...notifications,
        { id: Date.now(), label: "", time: extractTime(new Date()), expo_push_token:expoPushToken },
      ]);
    }
  };
  

  const updateNotification = (
    id: number,
    key: keyof NotificationItem,
    value: any
  ) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async (
    userId: string,
    notifications: NotificationItem[]
  ) => {
    await saveNotifications(user.userId, notifications);
  };

  const handleSubmit = () => {
    if (notifications.some((n) => n.label.trim() === "")) {
      alert("All notifications must have a label.");
      return;
    }
    handleSave(user.userId, notifications);
    showToast();

    //console.log(notifications[0].time);
  };

  const extractTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0"); // Ensures two digits
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0"); // Optional

    return `${hours}:${minutes}:${seconds}`;
  };
  const createDateWithTime = (timeString: string): Date => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date(); // Gets current date
    date.setHours(hours, minutes, seconds, 0); // Set extracted time

    return date;
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
  const handleTokenRegistration = async()=>{
    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token);

      //updateUserExpoPushToken(user.userId, token)
    });

  }

  useEffect(() => {
    handleTokenRegistration()
    

    getNotifications(user.userId).then(setNotifications);
  }, [user]);

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          color: "#555",
          marginBottom: 15,
          textAlign: "center",
        }}
      >
        Add up to {user.premiumUser ? 6 : 3} notifications at meaningful times
        to help track your habits!
      </Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginVertical: 10,
              marginBottom: 10,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <TextInput
                style={{
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight: 10,
                }}
                placeholder="Label (max 25 chars)"
                maxLength={25}
                value={item.label}
                onChangeText={(text) =>
                  updateNotification(item.id, "label", text)
                }
              />
              <TouchableOpacity onPress={() => removeNotification(item.id)}>
                <AntDesign name="minuscircleo" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={createDateWithTime(item.time)}
              mode="time"
              display="default"
              onChange={(_, selectedTime) => {
                if (selectedTime != undefined) {
                  updateNotification(
                    item.id,
                    "time",
                    extractTime(selectedTime)
                  );
                  setTimePicker(selectedTime);
                }
              }}
            />
          </View>
        )}
      />
      {notifications.length < (user.premiumUser ? 6 : 3) && (
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: "green" }]}
          onPress={addNotification}
        >
          <Text style={styles.submitButtonText}>Add Notification</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.submitButton]} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save</Text>
      </TouchableOpacity>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await getExpoPushToken(user.userId).then((token)=>{
            //console.log(token)
          });
        }}
      />
      <Toast />
    </View>
  );
};

export default NotificationSettings;

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
