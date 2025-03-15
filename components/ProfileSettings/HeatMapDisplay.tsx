import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Habit, HabitTrackingEntry } from "@/types/types";
import { getUserHabits, listenToHabitsTable } from "@/lib/supabase_habits";
import {
  getGridTrackingHistory,
  listenToTrackingHistory,
} from "@/lib/supabase_progress";
import { useGlobalContext } from "@/context/Context";
import { DateTime } from "luxon";
import { FlashList } from "@shopify/flash-list";
import {
  newHabitEmitter,
  deleteHabitEmitter,
  habitEmitter,
} from "@/events/eventEmitters";
import HabitHeatMap from "./HabitHeatMap";
import CalendarButton from "../CalendarButton";
import HabitYearView from "../HabitYearView";
import dayjs from "dayjs";
import TrackingWelcome from "./TrackingWelcome";
import Entypo from "@expo/vector-icons/Entypo";

const HeatMapDisplay = () => {
  const { user, isLoading } = useGlobalContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [lastHabit, setLastHabit] = useState("");
  const [habitsLength, setHabitsLength] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [gridData, setGridData] = useState<{
    [key: string]: HabitTrackingEntry[];
  }>({});
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

  const luxonDate = DateTime; // Automatically uses user's local time zone

  const now = new Date();
  const today = new Date(now.toDateString());
  const oneMonthAgo = getLastMonth(endDate);

  function getLastMonth(date: Date): Date {
    const lastMonthDate = new Date(date);
    lastMonthDate.setDate(lastMonthDate.getDate() - 100);
    return lastMonthDate;
  }

  useEffect(() => {
    setEndDate(today);
    setStartDate(oneMonthAgo);

    const fetchHabits = async () => {
      setLoading(true)
      const habitsData = await getUserHabits(user.userId);
      setHabits(habitsData);
      setLoading(false);
    };

    fetchHabits();

    const listener = newHabitEmitter.addListener("newHabit", () => {
      fetchHabits();
    });
    const deleteHabitListener = deleteHabitEmitter.addListener(
      "deleteHabit",
      () => {
        fetchHabits();
      }
    );
    const updateHabitListener = deleteHabitEmitter.addListener(
      "updateHabit",
      () => {
        fetchHabits();
      }
    );

    const unsubscribe = listenToHabitsTable((payload) => {
      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            console.log("Tracking Display Habit INSERT");
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "DELETE":
          if (payload.old) {
            console.log("Tracking Display Habit DELETE");
            setHabits((prevHabits) =>
              prevHabits.filter((habit) => habit.id !== payload.old.id)
            );
          }
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      listener.off;
    };
  }, [user.userId, habits.length]);

  useEffect(() => {
    const fetchGridData = async () => {
      const data: { [key: string]: HabitTrackingEntry[] } = {};

      if (habits.length > 0) {
        for (const habit of habits) {
          try {
            const habitData = await getGridTrackingHistory(
              user.userId,
              habit.id,
              startDate,
              today
            );
            if (habitData && Array.isArray(habitData)) {
              data[habit.id] = habitData;
            }
          } catch {
            const habitData = null;
          }
        }

        setGridData(data);
      }
    };

    if (habits.length > 0) {
      fetchGridData();
    } else {
      fetchGridData();
    }

    const unsubscribe = listenToTrackingHistory((payload) => {
      fetchGridData();
      switch (payload.eventType) {
        case "INSERT":
        case "UPDATE":
        case "DELETE":
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [habits.length]);

  function calculateMetrics(data: HabitTrackingEntry[]) {
    let totalTracked = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    const startDate = dayjs().subtract(100, "day").startOf("day");
    const validData = data.filter(
      (entry) =>
        (dayjs(entry.date).isAfter(startDate) ||
          dayjs(entry.date).isSame(startDate)) &&
        dayjs(entry.date).isBefore(dayjs().endOf("day"))
    );

    validData.forEach((entry) => {
      if (entry.count > 0) {
        totalTracked++;
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    const totalDays = validData.length;
    const consistencyPercentage =
      totalDays > 0 ? (totalTracked / totalDays) * 100 : 0;

    setMetrics({
      totalTracked,
      consistencyPercentage: consistencyPercentage.toFixed(0),
      longestStreak,
    });

    return metrics;
  }

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
    { label: "Daily", key: "Daily" },
    { label: "Weekly", key: "Weekly" },
    { label: "Bi-weekly", key: "Bi-weekly" },
  ];

  
  if (!loading && habits.length === 0) {
    return (
      <View style={{marginTop:50}}>
        <TrackingWelcome />
      </View>
    );
  }

  return (
    <ScrollView>
      <FlashList
        data={orderedGroups}
        keyExtractor={(item) => item.key}
        extraData={[gridData, expandedGroups]}
        renderItem={({ item }) => {
          const groupHabits = groupedHabits[item.key];
          if (!groupHabits || groupHabits.length === 0) return null;

          return (
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => toggleGroup(item.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: 'flex-start',
                  paddingHorizontal: 15,
                  marginBottom: 8,
                  marginTop: 12
                }}
              >
                {expandedGroups[item.key] ? (
                  <Entypo name="chevron-down" size={24} color="black" />
                ) : (
                  <Entypo name="chevron-right" size={24} color="black" />
                )}
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 20,
                    color: "#3e4e88",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>

              {expandedGroups[item.key] && (
                <View>
                  {groupHabits.map((habit) => {
                    const habitData = gridData[habit.id];
                    return (
                      <View key={habit.id} style={{ marginBottom: 20, padding: 8 }}>
                        {habitData ? (
                          <View style={styles.habitContainer}>
                            <View
                              style={{
                                width: "100%",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 8,
                              }}
                            >
                              <View style={{ flex: 1, flexDirection: "column" }}>
                                <Text style={styles.habitName}>
                                  {habit.name} {habit.emoji}
                                </Text>
                                <Text>
                                  {habit.frequency}x {habit.frequency_rate}
                                </Text>
                              </View>
                              <CalendarButton
                                label={habit.name + " Year In Review"}
                                content={<HabitYearView id={habit.id} />}
                              />
                            </View>
                            <HabitHeatMap data={habitData} />
                          </View>
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