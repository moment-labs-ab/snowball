import { View, Text } from "react-native";
import React from "react";

type InnerGoalViewProps = {
  id: string;
  created_at: Date;
  name: string;
  emoji: string;
  habit_ids: { [key: string]: any };
  tags: Object;
  description: string;
  expected_end_date: Date;
  milestones: Record<string, string>;
  color: string;
}

const InnerGoalView = ({id,
    name,
    emoji,
    habit_ids,
    tags,
    description,
    expected_end_date,
    milestones,
    color}:InnerGoalViewProps) => {
  return (
    <View style={{backgroundColor:color}}>
      <Text>{name}</Text>
      <Text>{description}</Text>
      <Text>{expected_end_date.toString()}</Text>
      <Text>{JSON.stringify(milestones)}</Text>
    </View>
  );
};

export default InnerGoalView;
