import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  addTracking, getTrackingCount,
} from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import { HabitTrackingEntry } from "@/types/types";
import { useTrackingContext } from "@/context/TrackingContext";
import EditHabitButton from "@/modals/EditHabitButton";
import EditHabitModal from "@/modals/EditHabitModal";
import LoadingSkeleton from "./LoadingSkeloton";

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

  const animatedValue = useRef(new Animated.Value(0)).current;
  // PanResponder to detect swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx !== 0 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
    })
  ).current;

  const getInitialCount = async (
    habitEntries: HabitTrackingEntry[],
    inputedDate: string
  ): Promise<number> => {
    if(frequency_rate_int == 1){
      const matchingEntry = habitEntries.find((entry) => entry.date === inputedDate);
      
      if (matchingEntry) {
        return matchingEntry.count;
      }
  }
  
    // Fetch count from database if not found in entries
    return await getTrackingCount(id, user.userId, date);
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
  
  useEffect(() => {
    if (trackingCount !== null) {
      setLoading(false); // Set loading after count is updated
  
      Animated.timing(animatedValue, {
        toValue: trackingCount / frequency,
        duration: 225,
        useNativeDriver: false,
      }).start();
    }
  }, [trackingCount]);

  type HabitTrackingData = { [key: string]: HabitTrackingEntry[] };

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
        count: 1
        });
    }

    return updatedHabitData;
  }

  const handlingPress = async (
    id: string,
    frequency: number,
    habitTrackingAmount: number
  ) => {
    const trackingData = await addTracking(user.userId, id, date);

    Animated.timing(animatedValue, {
      toValue: Math.min(trackingData / frequency),
      duration: 225,
      useNativeDriver: false,
    }).start();

    setTracking((prevTracking) => {
      return incrementHabitCount(
        prevTracking,
        id,
        formattedDate,
        "increment",
        trackingCount + 1
      );
    });
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
    Animated.timing(animatedValue, {
      toValue: Math.min(newTrackingCount / frequency),
      duration: 250,
      useNativeDriver: false,
    }).start();
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
  if(isLoadingTracking){
    return <LoadingSkeleton style={{
    borderRadius: 15,
    minHeight: 62,
    justifyContent: "center",
    borderWidth: 0.9,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
    flex: 1,}}/>
  }

  return (
    <TouchableOpacity
      {...panResponder.panHandlers}
      onPress={() => {
        handlingPress(id, frequency, trackingCount);
      }}
      activeOpacity={0.7}
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
                title={"Edit "}
                habit_id={id}
                selectedDate={date}
                trackingCount={trackingCount}
                onTrackingCountChange={handleTrackingCountChange}
              />
            }
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HabitCard;
