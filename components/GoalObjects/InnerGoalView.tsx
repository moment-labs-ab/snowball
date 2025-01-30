import { View, Text, SafeAreaView, StyleSheet, Alert, TouchableOpacity} from "react-native";
import React, { useEffect, useState } from "react";
import GoalHabitsView from "./GoalHabitsView";
import { Milestones } from "@/types/types";
import MilestoneList from "./MilestoneList";
import EditGoalButton from "./EditGoalButton";
import EditGoalForm from "./EditGoalForm";
import { Goal } from "@/types/types";
import {
  accomplishGoal,
  getUserSingleGoal,
  updateUserMilestones,
} from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import AntDesign from "@expo/vector-icons/AntDesign";

interface SelectedHabits {
  id: string;
  name: string;
}
type InnerGoalViewProps = {
  id: string;
  created_at: Date;
  name: string;
  emoji: string;
  habit_ids: SelectedHabits[];
  tags: Record<string, string>;
  description: string;
  expected_end_date: Date;
  milestones: Milestones[];
  color: string;
  contentToggled: boolean;
  refreshGoals: () => Promise<void>;
};

const InnerGoalView = ({
  id,
  created_at,
  name,
  emoji,
  habit_ids,
  tags,
  description,
  expected_end_date,
  milestones,
  color,
  contentToggled,
  refreshGoals,
}: InnerGoalViewProps) => {
  const { user, isLoading } = useGlobalContext();

  const [goalData, setGoalData] = useState<Goal>({
    id,
    created_at,
    name,
    emoji,
    habit_ids,
    tags,
    description,
    expected_end_date,
    milestones,
    color,
  });

  const updateMilestones = (updatedMilestones: typeof goalData.milestones) => {
    setGoalData((prevGoalData) => ({
      ...prevGoalData, // Keep all other properties the same
      milestones: updatedMilestones, // Update the milestones
    }));
  };
  const handleCheckMilestone = (index: number) => {
    const updatedMilestones = [...goalData.milestones];
    updatedMilestones[index].checked = !updatedMilestones[index].checked;

    updateMilestones(updatedMilestones);
    try {
      updateUserMilestones(user.userId, id, updatedMilestones);
      console.log("Milestones update complete.");
    } catch (error) {
      console.error("Error:", error);
    }
    console.log(
      `Milestone updated: ${updatedMilestones[index].milestone}`,
      updatedMilestones
    );
  };

  const fetchSingleGoal = async () => {
    const goalData = await getUserSingleGoal(user.userId, id);
    if (goalData) {
      setGoalData(goalData);
    }
  };

  //Accomplishing
  //Archiving
  const handleAccomplish = async (goal_id: string, user_id: string) => {
    Alert.alert(
      "Accomplish Goal",
      "Are you sure? You will not be able to re-activate this goal.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Accomplish canceled"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            const result = await accomplishGoal(goal_id, user_id);
            if (result.success) {
              console.log("Goal accomplished successfully");
              // Handle successful deletion, e.g., refresh the habit list
              //deleteHabitEmitter.emit('deleteHabit')
            } else {
              console.error("Error accomplishing goal:", result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: "default", // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );
  };

  useEffect(() => {
    fetchSingleGoal();
    console.log(goalData.habit_ids.length);
  }, [contentToggled, habit_ids.length, milestones.length, color]);

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
      <View style={{flex:1}}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          alignItems: "center",
        }}
      >
        <Text
          style={[styles.title, { color: color, flex: 1, textAlign: "center" }]}
        >
          {emoji} {name}
        </Text>
        <EditGoalButton
          label="Edit Goal"
          goalName={name}
          color={color}
          goalId={id}
          content={
            <EditGoalForm
              id={goalData.id}
              originalName={goalData.name}
              originalDescription={goalData.description}
              originalEmoji={goalData.emoji}
              originalColor={goalData.color}
              originalMilestones={goalData.milestones}
              originalTags={goalData.tags}
              original_expected_end_date={goalData.expected_end_date}
              original_habit_ids={goalData.habit_ids}
              refreshGoals={refreshGoals}
            />
          }
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>"{description}"</Text>
      </View>
      <View
        style={{
          marginBottom: 20,
          paddingHorizontal: 20,
          borderRadius: 1,
          borderColor: "black",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <AntDesign name="dotchart" size={20} color={color} />
            <Text style={styles.label}> Habit Tracking </Text>
          </View>
          <View>
            <Text style={styles.labelKey}>
              <Text style={{ color: color }}>Tracked</Text>
              <Text style={{ color: "#bababa" }}> / </Text>
              <Text style={{ color: "#afd2fc" }}>Expected</Text>
              <Text style={{ color: "#bababa" }}> / </Text>
              <Text style={{ color: "#6f6e79" }}>Days Left</Text>
            </Text>
          </View>
        </View>
        <View style={styles.line} />
        <GoalHabitsView
          habit_ids={goalData.habit_ids}
          created_at={goalData.created_at}
          expected_end_date={goalData.expected_end_date}
          color={goalData.color}
        />
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <AntDesign name="checkcircleo" size={20} color={color} />
            <Text style={styles.label}> Milestones</Text>
          </View>
        </View>
        <View style={styles.line} />
      </View>

      <MilestoneList
        data={goalData.milestones}
        onCheckMilestone={handleCheckMilestone}
        checkmarkColor={goalData.color}
      />
      </View>
      <View style={{paddingHorizontal:18}}>
      <TouchableOpacity
        onPress={() => {
          handleAccomplish(id, user.userId);
        }}
        style={[styles.archiveButton, { backgroundColor: color }]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: "black", marginRight: 5, flex: 1, textAlign: "center" },
            ]}
          >
            Accomplish Goal 🎉
          </Text>
        </View>
      </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  description: {
    textAlign: "center",
    fontWeight: "200",
    fontSize: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: "500",
  },
  line: {
    height: 1, // You can adjust this for line thickness
    backgroundColor: "black", // Change color as needed
    alignSelf: "stretch",
    marginBottom: 14,
    marginTop: 8,
  },
  labelKey: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
    fontWeight: "600",
  },
  archiveButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    borderWidth: 2,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
