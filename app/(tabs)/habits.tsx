import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Button,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import { useGlobalContext } from "@/context/Context";
import DatePicker from "@/components/DatePicker";

import DailyHabitDisplay from "@/components/DailyHabitDisplay";
import NewHabitButton from "@/modals/NewHabitButton";
import NewHabitModal from "@/modals/NewHabitModal";
import WelcomeModal from "@/components/HabitObjects/WelcomeModal";

import { getUserLoginCount } from "@/lib/supabase_profile";

const Habits = () => {
  const { user, isLoading } = useGlobalContext();
  const [deviceShaken, setDeviceShaken] = useState(false);
  //const { isShaken } = useShakeDetection();
  const [editRequested, setEditRequested] = useState(false);
  const [openWelcome, setOpenWelcome] = useState(false);
  const [userLogins, setUserLogins] = useState(0);
  const [loading, setLoading] = useState(false);

  const getCurrentTime = () => {
    let time_of_day: string;
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    if (hours < 12) {
      time_of_day = "Morning";
    } else if (hours >= 12 && hours <= 17) {
      time_of_day = "Afternoon";
    } else {
      time_of_day = "Evening";
    }
    return time_of_day;
  };
  const time_of_day = getCurrentTime();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  //MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const fetchUserLogins = async () => {
    setLoading(true);
    const logins = await getUserLoginCount(user.userId);
    if (logins) {
      setUserLogins(logins);
      if (logins === 1 || logins === 0) {
        setOpenWelcome(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserLogins();
  }, [user.username]); // Only fetch once when the component mounts

  if (loading) {
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#3e4e88" />
    </View>;
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#edf5fe", height: "100%" }}>
      <View className="flex-row justify-between align-center mt-6 mb-6">
        <View>
          <Text className="text-xl font-bold text-secondary pl-3">
            Good {time_of_day},
          </Text>
          <Text className="text-xl font-bold text-secondary pl-3">
            {user.username}
          </Text>
        </View>

        <NewHabitButton
          label={"Create a New Habit"}
          content={
            <NewHabitModal
              visible={modalVisible}
              onClose={handleCloseModal}
              title={"Create a New Habit"}
            />
          }
        />
      </View>
      <View
        style={{
          marginTop: 4,
          marginBottom: 14,
          paddingHorizontal: 3,
          alignItems: "center",
        }}
      >
        <DatePicker onDateChange={handleDateChange} />

        <View
          style={{
            height: 2, // Thickness of the line
            width: "90%", // Length of the line (adjust this to your desired length)
            backgroundColor: "#3e4e88", // Color of the line
            alignSelf: "center", // Centers the line within the parent container
            marginTop: 10, // Space between the DatePicker and the line
          }}
        />

        <View>
          {userLogins === 1 && (
            <WelcomeModal
              isOpen={openWelcome}
            />
          )}
        </View>
      </View>

      <DailyHabitDisplay
        selectedDate={selectedDate}
        editHabitOrder={editRequested}
      />
    </SafeAreaView>
  );
};

export default Habits;
