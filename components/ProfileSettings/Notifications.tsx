import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@expo/vector-icons/AntDesign";

interface NotificationItem {
  id: number;
  label: string;
  time: Date;
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = () => {
    if (notifications.length < 3) {
      setNotifications([
        ...notifications,
        { id: Date.now(), label: "", time: new Date() },
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

  const handleSubmit = () => {
    if (notifications.some((n) => n.label.trim() === "")) {
      alert("All notifications must have a label.");
      return;
    }
    console.log(notifications[0].time.toTimeString());
  };

  return (
    <View style={{ padding: 20 }}>
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
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom:10}}>
              <TextInput
                style={{
                  borderWidth: 1,
                  padding: 10,
                  borderRadius: 5,
                  flex: 1,
                  marginRight:10
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
              value={item.time}
              mode="time"
              display="default"
              onChange={(_, selectedTime) => {
                if (selectedTime)
                  updateNotification(item.id, "time", selectedTime);
              }}
            />
          </View>
        )}
      />
      {notifications.length < 3 && (
        <TouchableOpacity style={[styles.submitButton, {backgroundColor:'green'}]} onPress={addNotification}>
        <Text style={styles.submitButtonText}>Add Notification</Text>
      </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save</Text>
          </TouchableOpacity>
    </View>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: "#3e4e88",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        width: "100%",
      },
      submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
      },


})
