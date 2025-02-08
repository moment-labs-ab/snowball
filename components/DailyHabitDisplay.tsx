import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Habit } from "@/types/types";
import {
  getUserHabits,
  listenToHabitsTable,
  updateHabitOrder,
} from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import HabitCard from "./HabitCard";
import { FlashList } from "@shopify/flash-list";
import {
  newHabitEmitter,
  deleteHabitEmitter,
  habitEmitter,
} from "@/events/eventEmitters";
import HabitsWelcome from "./HabitsWelcome";

type dailyHabitDisplayProps = {
  selectedDate: Date;
  editHabitOrder: boolean;
};

const DailyHabitDisplay = ({
  selectedDate,
  editHabitOrder,
}: dailyHabitDisplayProps) => {
  const { user } = useGlobalContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [lastHabit, setLastHabit] = useState("");
  const [habitsLength, setHabitsLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  const fetchHabits = async () => {
    setLoading(true); 
    const habitsData = await getUserHabits(user.userId);
    setHabits(habitsData);
    setLoading(false);
  };
  useEffect(() => {
    //console.log("USEEFFECT: DailyHabitDisplay");
    if (editHabitOrder === true) {
      //console.log("Daily Habit Display Edit Request Received");
    }
   

    fetchHabits();

    const listener = newHabitEmitter.addListener("newHabit", () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchHabits();
    });
    const deleteHabitListener = deleteHabitEmitter.addListener(
      "deleteHabit",
      () => {
        fetchHabits();
      }
    );
    const unsubscribe = listenToHabitsTable((payload) => {
      //console.log("Change received!", payload);
      habitEmitter.emit("dataChanged");

      fetchHabits();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            console.log("IN INSERT");
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            console.log("IN UPDATE");
            setHabits((prevHabits) =>
              prevHabits.map((habit) =>
                habit.id === payload.new.id ? payload.new : habit
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            console.log("IN DELETE");
            setHabits((prevHabits) =>
              prevHabits.filter((habit) => habit.id !== payload.old.id)
            );
          }
          break;
      }
    });
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user.userId, selectedDate, habits.length]);


  if (!loading && habits.length === 0) {
    return (
     <HabitsWelcome />
    )
  }
  if (loading) {
    return(
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <ActivityIndicator size="large" color="#3e4e88" />
    </View>
    );
  }
  return (
    <FlashList
      data={habits}
      keyExtractor={(item) => item.id}
      indicatorStyle="black"
      renderItem={({ item }) => (
        <View className="flex-row mb-30">
          <HabitCard
            id={item.id}
            name={item.name}
            frequency={item.frequency}
            frequency_rate={item.frequency_rate}
            created_at={item.created_at}
            reminder={item.reminder}
            frequency_rate_int={item.frequency_rate_int}
            date={selectedDate}
            emoji={item.emoji}
            fetchHabits={fetchHabits}
          />
        </View>
      )}
      estimatedItemSize={80}
    />
  );
};

export default DailyHabitDisplay;
