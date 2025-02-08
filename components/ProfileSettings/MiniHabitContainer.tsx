import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { Habit } from "@/types/types";
import {
  getUserHabits,
  listenToHabitsTable,
  updateHabitOrder,
} from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import {
  newHabitEmitter,
  deleteHabitEmitter,
  habitEmitter,
} from "@/events/eventEmitters";
import AntDesign from "@expo/vector-icons/AntDesign";
import SettingsGoals from "../Profile/SettingsGoals";
import SettingsHabits from "../Profile/SettingsHabits";



const MiniHabitContainer = () => {
  const { user } = useGlobalContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitInitials, setHabitInitials] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);

  const toggleContent = () => {
    setIsVisible(!isVisible);
  };

  function getFirstThreeHabitInitials(habits: Habit[]): string[] {
    return habits
        .slice(0, 3)
        .map(habit => habit.emoji)
}

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      const habitsData = await getUserHabits(user.userId);
      setHabits(habitsData);
      setLoading(false);
    };

    fetchHabits();
    if(habits){
        const initials = getFirstThreeHabitInitials(habits)
        setHabitInitials(initials)
    }

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
            //console.log("IN INSERT");
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            //console.log("IN UPDATE");
            setHabits((prevHabits) =>
              prevHabits.map((habit) =>
                habit.id === payload.new.id ? payload.new : habit
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            //console.log("IN DELETE");
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
  }, [user.userId, habits.length]);
  if (loading) {
    return(
      <View style={styles.container}>
        <View style={styles.content}>
    <ActivityIndicator size="small" color="#3e4e88" />
    </View>
    </View>
    );
  }
  return (
   

<View>
<TouchableOpacity onPress={toggleContent}>
<View style={styles.container}>
      <View style={styles.content}>
      <View style={styles.circleContainer}>
                {habitInitials.map((initial, index) => (
                    <View 
                        key={index}
                        style={styles.circleStyle}
                    >
                        <Text>{initial}</Text>
                    </View>
                ))}
            </View>
        <Text style={{fontWeight:'600'}}>{habits.length} {habits.length === 1 ? "Habit" : "Habits"}</Text>
      </View>
    </View>
</TouchableOpacity>

<Modal
  visible={isVisible}
  animationType="slide"
  onRequestClose={toggleContent}
  presentationStyle="pageSheet"
>
  <SafeAreaView style={styles.modalContainer}>
  <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={toggleContent}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { color: "#3e4e88" }]}>Habits</Text>
        </View>
        {/* Add an empty View for balanced spacing */}
        <View style={styles.spacer} />
      </View>
      <View>
        <SettingsHabits />
      </View>
  </SafeAreaView>
</Modal>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: .25,
    width: 120,
    height: 60,
    borderRadius: 8,
  },
  content: {
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
  },
  circleStyle : {
    width: 30,          // w-8
    height: 30,         // h-8
    borderRadius: 20, // rounded-full
    flexDirection: 'row',   // flex-row
    alignItems: 'center',   // items-center
    justifyContent: 'center', // justify-center
    color: '#FFFFFF',       // text-white
    fontSize: 1.25,    // text-xl
    fontWeight: '700', 
    
    
    backgroundColor:'#c2dcfc'     // needed for flex properties to work
  },
  circleContainer:{
    gap:1,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ensures even spacing between elements
    padding: 16,
    backgroundColor: "#edf5fe",
    height: 60,
  },
  backButton: {
    justifyContent: "center", // Centers the content inside the back button
    alignItems: "center",
  },
  headerText: {
    flex: 1, // Allows the text to expand and take up remaining space
    textAlign: "center", // Centers the text within its allocated space
    fontSize: 20,
    fontWeight: "600",
    color: "#3e4e88",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  spacer: {
    width: 24, // Same width as backButton for balance
  },
});

export default MiniHabitContainer;
