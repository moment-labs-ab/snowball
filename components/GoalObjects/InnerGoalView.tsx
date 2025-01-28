import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import GoalHabitsView from "./GoalHabitsView";
import { Milestones } from "@/types/types";
import MilestoneList from "./MilestoneList";
import EditGoalButton from "./EditGoalButton";
import EditGoalForm from "./EditGoalForm";
import { Goal } from "@/types/types";
import { getUserSingleGoal, updateUserMilestones } from "@/lib/supabase_goals";
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
      console.log('Milestones update complete.');
    } catch (error) {
      console.error('Error:', error);
    }
    console.log(`Milestone updated: ${updatedMilestones[index].milestone}`, updatedMilestones);
  };

  const fetchSingleGoal = async () => {
    const goalData = await getUserSingleGoal(user.userId, id);
    if (goalData) {
      setGoalData(goalData);
    }
  };

  useEffect(() => {
    fetchSingleGoal();
    console.log(goalData.habit_ids.length);
  }, [contentToggled, habit_ids.length, milestones.length]);

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
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
      <View style={{ marginBottom: 20, paddingHorizontal: 20, borderRadius:1, borderColor:'black' }}>
        <View style={{ flexDirection: "row", justifyContent:'flex-start' }}>
          <AntDesign name="dotchart" size={20} color={color} />
          <Text style={styles.label}> Habit Tracking</Text>
        </View>
        <GoalHabitsView
          habit_ids={goalData.habit_ids}
          created_at={goalData.created_at}
          expected_end_date={goalData.expected_end_date}
          color={goalData.color}
        />
      </View>
      <View style={{paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent:'flex-start'}}>
          <AntDesign name="checkcircleo" size={20} color={color}/>
          <Text style={styles.label}> Milestones</Text>
        </View>
      </View>

      <MilestoneList
        data={goalData.milestones}
        onCheckMilestone={handleCheckMilestone}
        checkmarkColor={goalData.color}
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
    marginBottom: 20,
  },
  description: {
    textAlign: "center",
    fontWeight: "200",
    fontSize:12
  },
  label: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 14,
  },
});
