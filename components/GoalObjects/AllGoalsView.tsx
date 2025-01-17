import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { getUserGoals } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { FlashList } from "@shopify/flash-list";
import { Goal } from "@/types/types";
import GoalObject from "./GoalObject";
import { goalEmitter } from "@/events/eventEmitters";
import { listenToGoalsTable } from "@/lib/supabase_goals";
import { ActivityIndicator } from "react-native";

const AllGoalsView = () => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [orderedGoals, setOrderedGoals] = useState<Goal[]>([]);

  const fetchUserGoals = async () => {
    const data = await getUserGoals(user.userId);
    //console.log(data)
    setGoals(data);
  };

  useEffect(() => {
    fetchUserGoals();

    const listener = goalEmitter.addListener("newHabitInGoals", () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchUserGoals();
    });

    const unsubscribe = listenToGoalsTable((payload) => {
      console.log("Change received!", payload);
      fetchUserGoals();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            console.log("IN INSERT");
            setGoals((prevGoals) => [...prevGoals, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            console.log("IN UPDATE");
            setGoals((prevGoals) =>
              prevGoals.map((Goal) =>
                Goal.id === payload.new.id ? payload.new : Goal
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            console.log("IN DELETE");
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

  if (goals.length == 0) {
    return <ActivityIndicator size="large" color="#3e4e88" />;
  } else {
    return (
      <ScrollView>
      <View style={styles.container}>
        <FlashList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalContainer}>
              <GoalObject
                id={item.id}
                created_at={item.created_at}
                name={item.name}
                emoji={item.emoji}
                habit_ids={item.habit_ids}
                tags={item.tags}
                description={item.description}
                expected_end_date={item.expected_end_date}
                milestones={item.milestones}
                color={item.color}
              />
            </View>
          )}
          estimatedItemSize={200}
          numColumns={2} // This specifies two items per row
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ScrollView>
    );
  }
};

export default AllGoalsView;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height,
    width: "100%",
  },
  goalContainer: {
    flex: 1, // Ensures the items share space equally
    margin: 4, // Adjust spacing between items
  },
  listContent: {
    padding: 2,
    paddingHorizontal:2
  },
});
