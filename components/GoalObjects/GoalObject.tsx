import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { getUserGoals } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { FlashList } from "@shopify/flash-list";
import { Goal } from "@/types/types";

type GoalObjectProps = {
  id: string;
  created_at: Date;
  name: string;
  emoji: string;
  habit_ids: { [key: string]: any };
  tags: Object;
  description: string;
  expected_end_date: Date;
  milestones: Record<string, string>;
  color: string
};

type HabitIdItem = {
  id: string;
  value: any;
};

const GoalObject = ({
  id,
  name,
  emoji,
  habit_ids,
  tags,
  description,
  expected_end_date,
  milestones,
  color
}: GoalObjectProps) => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>();
  const [habitIdsList, setHabitIdsList] = useState<HabitIdItem[]>([]);

  const renderHabitItem = ({ item }: { item: HabitIdItem }) => (
    <View
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
    >
      <Text>Habit {item.id}</Text>
      <Text>Value: {JSON.stringify(item.value.name)}</Text>
    </View>
  );

  useEffect(() => {
    // Convert habit_ids object to an array of key-value pairs
    const habitIdsArray = Object.entries(habit_ids).map(([id, value]) => ({
      id,
      value,
    }));
    setHabitIdsList(habitIdsArray);
  }, [habit_ids]);

  const onPress = ()=>{
    console.log(id,name, milestones, habit_ids)
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress}>
      <View style={[styles.goalContainer, {backgroundColor: color}]}>
        <View style={styles.contentContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.date}>{expected_end_date.toString()}</Text>
        </View>
      </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  goalContainer: {
    // Remove the border and add shadow properties
    borderRadius: 8,
    width: '100%',
    aspectRatio: 1,
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow position
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 6, // Shadow spread
    elevation: 5, // Android shadow
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign:'center',
    padding:2
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});

export default GoalObject;