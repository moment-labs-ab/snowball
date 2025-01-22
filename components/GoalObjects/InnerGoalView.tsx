import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import GoalHabitsView from "./GoalHabitsView";
import { Milestones } from "@/types/types";
import MilestoneList from "./MilestoneList";
import EditGoalButton from "./EditGoalButton";
import EditGoalForm from "./EditGoalForm";
import { getUserGoals } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { Goal } from "@/types/types";
import { listenToGoalsTable } from "@/lib/supabase_goals";

interface SelectedHabits {
  id: string;
  name: string;
}
type InnerGoalViewProps = {
  goal: Goal
};

const InnerGoalView = ({
goal}: InnerGoalViewProps) => {
  

  const { user, isLoading } = useGlobalContext();
  const [trigger, setTrigger] = useState(0)

  const findGoalById = (goals: Goal[], id: string): Goal | undefined => {
    return goals.find(goal => goal.id === id);
  };



  useEffect(() => {

    const unsubscribe = listenToGoalsTable((payload) => {
      console.log("Change received!", payload);
      //fetchUserGoals();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            setTrigger((prev) => prev + 1)
          }
          break;
        case "UPDATE":
          if (payload.new) {
            setTrigger((prev) => prev + 1)
          }
          break;
        case "DELETE":
          if (payload.old) {
            setTrigger((prev) => prev + 1)
          }
          break;
      }
    });
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      //habitEmitter.emit('dataChanged');
    };
    

    
  }, [trigger]);


  return (
    <SafeAreaView style={{ padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={[styles.title, { color: goal.color, flex: 1, textAlign: "center" }]}
        >
          {goal.emoji} {goal.name}
        </Text>
        <EditGoalButton
          label="Edit Goal"
          goalName={goal.name}
          color={goal.color}
          goalId={goal.id}
          content={
          <EditGoalForm 
          id={goal.id}
          originalName={goal.name}
          originalDescription={goal.description}
          originalEmoji={goal.emoji}
          originalColor={goal.color}
          originalMilestones={goal.milestones}
          originalTags={goal.tags}
          original_expected_end_date={goal.expected_end_date}
          original_habit_ids={goal.habit_ids}/>}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>"{goal.description}"</Text>
      </View>
      <GoalHabitsView
        habit_ids={goal.habit_ids}
        created_at={goal.created_at}
        expected_end_date={goal.expected_end_date}
        color={goal.color}
      />

    </SafeAreaView>
  );
};

export default InnerGoalView;

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 5,
    marginBottom:20
  },
  description: {
    textAlign: "center",
    fontWeight: "200",
  },
});
