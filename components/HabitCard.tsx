import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { addTracking, getTrackingCount, updateTracking } from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import { HabitTrackingEntry } from "@/types/types";
import { useTrackingContext } from "@/context/TrackingContext";
import EditHabitButton from "@/modals/EditHabitButton";
import EditHabitModal from "@/modals/EditHabitModal";
import LoadingSkeleton from "./LoadingSkeloton";

import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

type habitCardProps = {
  id: string;
  created_at: string;
  name: string;
  frequency: number;
  frequency_rate: string;
  reminder: boolean;
  frequency_rate_int: number;
  date: Date;
  order?: number;
  emoji: string;
  fetchHabits: () => {};
};

const HabitCard = ({
  id,
  created_at,
  name,
  frequency,
  frequency_rate,
  reminder,
  frequency_rate_int,
  date,
  order,
  emoji,
  fetchHabits,
}: habitCardProps) => {
  const { user, isLoading } = useGlobalContext();
  const { tracking, setTracking, isLoadingTracking } = useTrackingContext();
  const [trackingCount, setTrackingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [trackingColor, setTrackingColor] = useState<string>("#9ec8fb");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [singleDayCount, setSingleDayCount] = useState(0);

  type HabitTrackingData = { [key: string]: HabitTrackingEntry[] };

  //Animated Tracking Logic
  const translateX = useSharedValue(0);
  const pan = Gesture.Pan()
  .onUpdate((event) => {
    // Only track horizontal movement if it's significantly more than vertical
    if (Math.abs(event.translationX) > Math.abs(event.translationY) * 2) {
      translateX.value = event.translationX;
    }
  })
  .onEnd(() => {
    const SWIPE_THRESHOLD = 40;

    if (translateX.value > SWIPE_THRESHOLD) {
      handlingPress(id, 1);
    } else if (translateX.value < -SWIPE_THRESHOLD && trackingCount > 0) {
      handlingPress(id, -1)
    }

    // Reset after end
    translateX.value = 0;
  })
  .onTouchesDown(() => {
    translateX.value = 0;
  })
  .activeOffsetX([-15, 15])  // Activate after 15px horizontal movement
  .failOffsetY([-5, 5])      // Fail if vertical movement exceeds 5px first
  .minDistance(10)
  .runOnJS(true);

  const animatedValue = useRef(new Animated.Value(0)).current;
  // PanResponder to detect swipe gestures

  const animateIncrement = (count: number)=>{
    Animated.timing(animatedValue, {
      toValue: count / frequency,
      duration: 225,
      useNativeDriver: false,
    }).start();

  }


  const getInitialCount = async (
    habitEntries: HabitTrackingEntry[],
    inputedDate: string
  ): Promise<number> => {
      const matchingEntry = habitEntries.find(
        (entry) => entry.date === inputedDate
      );

      if (matchingEntry) {
        if (frequency_rate_int == 1) {
        setSingleDayCount(matchingEntry.count)
        const count = matchingEntry.count;
        animateIncrement(count)
        return count
        }
        else{
          setSingleDayCount(matchingEntry.count)
          const count =  await getTrackingCount(id, user.userId, date);
          animateIncrement(count)
        return count
        }
      }
        const count = await getTrackingCount(id, user.userId, date);
        animateIncrement(count)
        return count



    // Fetch count from database if not found in entries
  };



  useEffect(() => {
    setFormattedDate(new Date(date.toDateString()).toISOString().split("T")[0]);
  }, [date]);

  useEffect(() => {
    const fetchTrackingCount = async () => {
      if (!tracking[id]) return; // Ensure tracking data exists
      const count = await getInitialCount(tracking[id], formattedDate);
      setTrackingCount(count);
    };

    fetchTrackingCount();

  }, [id, formattedDate, tracking]);



  function incrementHabitCount(
    habitData: HabitTrackingData,
    id: string,
    date: string,
    type: string,
    newCount: number
  ): HabitTrackingData {
    const updatedHabitData = { ...habitData };

    // Ensure there is an array for this habit
    if (!updatedHabitData[id]) {
      updatedHabitData[id] = [];
    }

    // Find the entry with the matching date
    const existingEntryIndex = updatedHabitData[id].findIndex((entry) => {
      return entry.date === date;
    });

    if (existingEntryIndex !== -1) {
      if (type == "increment") {
        // If entry exists, increment its count
        updatedHabitData[id] = [...updatedHabitData[id]]; // Create a new array to avoid mutation
        updatedHabitData[id][existingEntryIndex] = {
          ...updatedHabitData[id][existingEntryIndex],
          count: updatedHabitData[id][existingEntryIndex].count + 1,
        };
      } else if (type == "update") {
        updatedHabitData[id] = [...updatedHabitData[id]]; // Create a new array to avoid mutation
        updatedHabitData[id][existingEntryIndex] = {
          ...updatedHabitData[id][existingEntryIndex],
          count: newCount,
        };
      }
    } else {
      // If no entry exists for today, add a new entry
      updatedHabitData[id].push({
        date: date, // Store as local date string
        count: 1,
      });
    }

    return updatedHabitData;
  }

  const handlingPress = async (
    id: string,
    increment: number,
  ) => {
    if(increment > 0){
      animateIncrement(trackingCount + 1)
      setTrackingCount(trackingCount + 1);
    const trackingData = await addTracking(user.userId, id, date);

    setTracking((prevTracking) => {
      return incrementHabitCount(
        prevTracking,
        id,
        formattedDate,
        "increment",
        trackingCount + increment
      );
    });
  }else if(increment < 0){
    animateIncrement(trackingCount - 1)
    setTrackingCount(trackingCount - 1);
    const result = await updateTracking(
      user.userId,
      id,
      date,
      -(trackingCount - (trackingCount - 1))
    );
    handleTrackingCountChange(trackingCount - 1)

  }
  };

  const handleTrackingCountChange = (newTrackingCount: number) => {
    setTrackingCount(newTrackingCount);
    setTracking((prevTracking) => {
      return incrementHabitCount(
        prevTracking,
        id,
        formattedDate,
        "update",
        newTrackingCount
      );
    });
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [trackingColor, trackingColor],
  });

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  //Edit Habits MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    fetchHabits();
  };
  if (isLoadingTracking) {
    return (
      <LoadingSkeleton
        style={{
          borderRadius: 15,
          minHeight: 62,
          justifyContent: "center",
          borderWidth: 0.9,
          marginHorizontal: 16,
          marginBottom: 16,
          overflow: "hidden",
          position: "relative",
          flex: 1,
        }}
      />
    );
  }

  return (
    <GestureDetector gesture={pan}>
    <TouchableOpacity
      onPress={() => {
        handlingPress(id, 1);
      }}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#edf5fe",
        borderRadius: 15,
        minHeight: 62,
        justifyContent: "center",
        borderWidth: 0.9,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: "hidden",
        position: "relative",
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width,
          backgroundColor,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 5,
          flex: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
          <View style={{ flex: 1, paddingLeft: 5 }}>
            <Text
              style={{
                color: "black",
                fontWeight: "600",
                fontSize: 18,
                zIndex: 1,
              }}
            >
              {name}
            </Text>

            <Text
              style={{
                color: "#525756",
                fontSize: 10,
                fontWeight: "200",
              }}
            >
              {trackingCount}/{frequency}
            </Text>
          </View>

          <EditHabitButton
            content={
              <EditHabitModal
                visible={modalVisible}
                onClose={handleCloseModal}
                title={name}
                habit_id={id}
                selectedDate={date}
                trackingCount={trackingCount}
                onTrackingCountChange={handleTrackingCountChange}
                singleDayCount={singleDayCount}
              />
            }
          />
        </View>
      </View>
    </TouchableOpacity>
    </GestureDetector>
  );
};

export default HabitCard;
