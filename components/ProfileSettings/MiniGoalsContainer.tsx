import { View, Text, Dimensions, ScrollView, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { Goal } from "@/types/types";
import { getUserGoals, listenToGoalsTable } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { goalEmitter } from "@/events/eventEmitters";
import AntDesign from "@expo/vector-icons/AntDesign";
import SettingsGoals from "../Profile/SettingsGoals";
import { ActivityIndicator } from "react-native";

type MiniGoalPair = {
    emoji: string,
    color: string
}

const MiniGoalsContainer = () => {
    const { user } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [miniGoal, setMiniGoals] = useState<MiniGoalPair[]>([])
  const [isVisible, setIsVisible] = useState(false);

  const toggleContent = () => {
    setIsVisible(!isVisible);
  };



  const fetchUserGoals = async () => {
    setLoading(true)
    const data = await getUserGoals(user.userId);
  
    // Sort by expected_end_date first and then by name
    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.expected_end_date).getTime();
      const dateB = new Date(b.expected_end_date).getTime();
  
      // Compare dates first
      if (dateA !== dateB) {
        return dateA - dateB;
      }
  
      // If dates are the same, compare names
      return a.name.localeCompare(b.name);
    });
  
    setGoals(sortedData);
    setLoading(false)
  };

  function getFirstThreeGoalEmojis(goals: Goal[]): MiniGoalPair[] {
    const rawData = goals
        .slice(0, 3)
        .map(goal => [goal.emoji, goal.color])
    return rawData.map(([emoji, color]) => ({
        emoji,
        color,
      }));
}

  useEffect(() => {
    fetchUserGoals();

    if(goals){
        const miniGoalData = getFirstThreeGoalEmojis(goals)
        setMiniGoals(miniGoalData)
    }

    const listener = goalEmitter.addListener("newHabitInGoals", () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchUserGoals();
    });

    const unsubscribe = listenToGoalsTable((payload) => {
      //console.log("Change received!", payload);
      fetchUserGoals();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            //console.log("IN INSERT");
            setGoals((prevGoals) => [...prevGoals, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            //console.log("IN UPDATE");
            setGoals((prevGoals) =>
              prevGoals.map((Goal) =>
                Goal.id === payload.new.id ? payload.new : Goal
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            //console.log("IN DELETE");
            setGoals((prevGoals) =>
              prevGoals.filter((Goal) => Goal.id !== payload.old.id)
            );
          }
          break;
      }
    });
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      //habitEmitter.emit('dataChanged');
    };
  }, [goals.length]);


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
          {miniGoal.map((goal, index) => (
            <View 
              key={index}
              style={[styles.circleStyle, { backgroundColor: goal.color }]} // Apply background color
            >
              <Text style={styles.emojiText}>{goal.emoji}</Text> 
            </View>
          ))}
        </View>
        <Text style={{fontWeight:'600'}}>{goals.length} {goals.length === 1 ? "Goal" : "Goals"}</Text>
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
          <Text style={[styles.headerText, { color: "#3e4e88" }]}>Goals</Text>
        </View>
        {/* Add an empty View for balanced spacing */}
        <View style={styles.spacer} />
      </View>
      <View>
        <SettingsGoals />
      </View>
  </SafeAreaView>
</Modal>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
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
    fontWeight: '700',      // needed for flex properties to work
  },
  circleContainer:{
   
    gap:1,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row'
  },
  emojiText: {
    fontSize: 14, // Adjust size to fit inside the circle
    textAlign: 'center',
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

export default MiniGoalsContainer