import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useContext, useEffect, useState } from "react";
import { useGlobalContext } from "@/context/Context";
import images from "../../constants/images";
import LoadingScreen from "@/components/LoadingScreen";
import DatePicker from "@/components/DatePicker";
import CustomButton from "@/components/CustomButtom";
import NewHabit from "@/modals/NewHabit";
import DailyHabitDisplay from "@/components/DailyHabitDisplay";
import Toast from "react-native-toast-message";
import useShakeDetection from "@/events/useShakeDetection";
import NewHabitButton from "@/modals/NewHabitButton";
import NewHabitModal from "@/modals/NewHabitModal";

const Habits = () => {
  const { user, isLoading } = useGlobalContext();
  const [deviceShaken, setDeviceShaken] = useState(false);
  //const { isShaken } = useShakeDetection();
  const [editRequested, setEditRequested] = useState(false);

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
    //console.log('Selected date:', date);
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

  return (
    <SafeAreaView className="bg-background h-full">
      <View className="flex-row justify-between items-center mt-6 mb-6">
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
        {/**<View> 
              <TouchableOpacity
                  onPress={handleOpenModal}
                  activeOpacity={0.7}
                  className="bg-secondary rounded-full w-12 h-12 justify-center items-center mr-3"
                >
                  <Text className="text-white font-pbold text-lg">+</Text>
                </TouchableOpacity></View>
              */}

        {/**
            <View>
              <Image
                source={images.snowballlogo}
                className="w-[80px] h-[80px]"
                resizeMode="contain"
              />
            </View>
            */}
      </View>
      <View
        style={{
          marginTop: 4,
          marginBottom: 30,
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
      </View>
      {/**
              <View>
              <NewHabit visible={modalVisible} onClose={handleCloseModal} title={"Create a New Habit"}/>
              </View>
              */}

      <DailyHabitDisplay
        selectedDate={selectedDate}
        editHabitOrder={editRequested}
      />
    </SafeAreaView>
  );
};

export default Habits;
