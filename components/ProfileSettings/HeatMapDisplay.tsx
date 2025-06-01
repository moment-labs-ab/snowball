import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Habit } from "@/types/types";
import { useGlobalContext } from "@/context/Context";
import { FlashList } from "@shopify/flash-list";
import TrackingWelcome from "./TrackingWelcome";
import Entypo from "@expo/vector-icons/Entypo";
import { useHabitContext } from "@/context/HabitContext";
import { useTrackingContext } from "@/context/TrackingContext";
import MonthlyTracking from "./MonthlyTracking";

const HeatMapDisplay = () => {
  const { user, isLoading } = useGlobalContext();
  const { habits } = useHabitContext();
  const { tracking, setTracking, isLoadingTracking } = useTrackingContext();
  const [lastHabit, setLastHabit] = useState("");
  const [habitsLength, setHabitsLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Adjust threshold as needed

  const handleMonthSelection = (selectedDate: Date) => {
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ); // 0 gives the last day of the previous month

    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  };

  const habitContainerStyle = {
    height: isLargeScreen
      ? Dimensions.get("window").height / 2
      : Dimensions.get("window").height / 1.9,
  };

  // Add state for expanded/collapsed groups
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({
    Daily: true,
    Weekly: true,
    "Bi-weekly": true,
  });

  const [metrics, setMetrics] = useState({
    totalTracked: 0,
    consistencyPercentage: "0",
    longestStreak: 0,
  });

  // Toggle group expansion function
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  useEffect(() => {
    handleMonthSelection(startDate);
  }, [user.userId, habits.length, habits, tracking, isLoadingTracking, user.premiumUser]);

  // Group the habits by frequency_rate
  const groupedHabits = habits.reduce((acc, habit) => {
    const frequency = habit.frequency_rate;
    if (!acc[frequency]) {
      acc[frequency] = [];
    }
    acc[frequency].push(habit);
    return acc;
  }, {} as { [key: string]: Habit[] });

  // Order the groups by frequency_rate
  const orderedGroups = [
    { label: "Daily Habits", key: "Daily" },
    { label: "Weekly Habits", key: "Weekly" },
    { label: "Bi-weekly Habits", key: "Bi-weekly" },
  ];

  if (habits.length === 0) {
    return (
      <View style={{ marginTop: 50 }}>
        <TrackingWelcome />
      </View>
    );
  } else if (isLoadingTracking || isLoading) {
    return <ActivityIndicator size="large" color="#3e4e88" />;
  }

  return (
    <ScrollView>
      <FlashList
        data={orderedGroups}
        keyExtractor={(item) => item.key}
        extraData={[tracking, expandedGroups]}
        renderItem={({ item }) => {
          const groupHabits = groupedHabits[item.key];
          if (!groupHabits || groupHabits.length === 0) return null;

          return (
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => toggleGroup(item.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingHorizontal: 12,
                }}
              >
                {expandedGroups[item.key] ? (
                  <Entypo name="chevron-down" size={16} color="black" />
                ) : (
                  <Entypo name="chevron-right" size={16} color="black" />
                )}
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#8BBDFA",
                    backgroundColor: "#8BBDFA",
                  }}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 20,
                    color: "#3e4e88",
                    marginHorizontal: 5,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#8BBDFA",
                    backgroundColor: "#8BBDFA",
                    marginRight: 2,
                  }}
                />
              </TouchableOpacity>

              {expandedGroups[item.key] && (
                <View>
                  {groupHabits.map((habit) => {
                    return (
                      <View
                        key={habit.id}
                        style={{ marginBottom: 20, padding: 8 }}
                      >
                        {habit ? (
                          <MonthlyTracking
                            habit_name={habit.name}
                            habit_emoji={habit.emoji}
                            habit_id={habit.id}
                          />
                        ) : (
                          <View style={styles.container}>
                            <ActivityIndicator size="large" color="#3e4e88" />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
        estimatedItemSize={300}
        nestedScrollEnabled={true}
      />
    </ScrollView>
  );
};

export default HeatMapDisplay;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    width: Dimensions.get("window").width - 20,
    height: 300,
    marginBottom: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  viewContainer: {
    height: Dimensions.get("window").height,
    width: "100%",
  },
  habitContainer: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 5,
    paddingBottom: 10,
  },
  habitName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8BBDFA",
  },
  statsContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
  },
  metricContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  metric: {
    fontWeight: "bold",
    color: "#5a626f",
    fontSize: 18,
  },
  metricText: {
    fontWeight: "bold",
    color: "#788599",
    justifyContent: "center",
    alignContent: "center",
    fontSize: 12,
  },
});
