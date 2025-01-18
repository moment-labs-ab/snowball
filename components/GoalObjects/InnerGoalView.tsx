import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import GoalHabitsView from "./GoalHabitsView";
import { Milestones } from "@/types/types";
import MilestoneList from "./MilestoneList";
import EditGoalButton from "./EditGoalButton";
import EditGoalForm from "./EditGoalForm";

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
  tags: Object;
  description: string;
  expected_end_date: Date;
  milestones: Milestones[];
  color: string;
  contentToggled: boolean;
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
}: InnerGoalViewProps) => {
  useEffect(() => {
    console.log(JSON.stringify(milestones));
  }, [contentToggled]);
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
          style={[styles.title, { color: color, flex: 1, textAlign: "center" }]}
        >
          {emoji} {name}
        </Text>
        <EditGoalButton
          label="Edit Goal"
          goalName={name}
          color={color}
          content={<EditGoalForm 
          id={id}
          originalName={name}
          originalDescription={description}
          originalEmoji={emoji}
          originalColor={color}
          originalMilestones={milestones}
          originalTags={tags}
          original_expected_end_date={expected_end_date}
          original_habit_ids={habit_ids}/>}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>"{description}"</Text>
      </View>
      <GoalHabitsView
        habit_ids={habit_ids}
        created_at={created_at}
        expected_end_date={expected_end_date}
      />

      <MilestoneList data={milestones} />
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
  },
  description: {
    textAlign: "center",
    fontWeight: "200",
  },
});
