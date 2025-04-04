import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/Context";
import { useGoalContext } from "@/context/GoalContext";
import { FlashList } from "@shopify/flash-list";
import { Goal } from "@/types/types";
import GoalObject from "./GoalObject";
import { ActivityIndicator } from "react-native";
import GoalsWelcome from "./GoalsWelcome";

const AllGoalsView = () => {
  const { user } = useGlobalContext();
  const { goals } = useGoalContext();
  const [sortedGoals, setSortedGoals] = useState<Goal[]>([]);
  const [orderedGoals, setOrderedGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserGoals = async () => {
    setLoading(true);

    // Sort by expected_end_date first and then by name
    const sortedData = goals.sort((a, b) => {
      const dateA = new Date(a.expected_end_date).getTime();
      const dateB = new Date(b.expected_end_date).getTime();

      // Compare dates first
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // If dates are the same, compare names
      return a.name.localeCompare(b.name);
    });

    setSortedGoals(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserGoals();
    
  }, [goals]);

  if (!loading && goals.length === 0) {
    return <GoalsWelcome />;
  }
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  } else {
    return (
        <View style={styles.container}>
          <FlashList
            data={sortedGoals}
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
                  accomplished={item.accomplished}
                  archived={item.archived}
                  accomplished_at={item.accomplished_at}
                  archived_at={item.archived_at}
                  refreshGoals={fetchUserGoals}
                />
              </View>
            )}
            estimatedItemSize={200}
            numColumns={2} // This specifies two items per row
            contentContainerStyle={styles.listContent}
          />
        </View>
    );
  }
};

export default AllGoalsView;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height + 200,
    width: "100%",
    flex: 1
  },
  goalContainer: {
    flex: 1, // Ensures the items share space equally
    margin: 4, // Adjust spacing between items
  },
  listContent: {
    padding: 2,
    paddingHorizontal: 2,
  },
});
