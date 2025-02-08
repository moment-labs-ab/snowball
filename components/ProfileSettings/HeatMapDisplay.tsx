import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
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
import { habitEmitter } from "@/events/eventEmitters";
import HabitHeatMap from "./HabitHeatMap";
import CalendarButton from "../CalendarButton";
import HabitYearView from "../HabitYearView";
import dayjs from "dayjs";

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

  const [metrics, setMetrics] = useState({
    totalTracked: 0,
      consistencyPercentage: "0",
      longestStreak:0,
  })

  const luxonDate = DateTime; // Automatically uses user's local time zone

  const now = new Date();
  const today = new Date(now.toDateString());
  const oneMonthAgo = getLastMonth(endDate);

  function getLastMonth(date: Date): Date {
    const lastMonthDate = new Date(date);
    lastMonthDate.setDate(lastMonthDate.getDate() - 100);
    return lastMonthDate;
  }

  // Automatically uses user's local time zone
  //console.log(today.toString());

  useEffect(() => {
    //console.log(today)
    setEndDate(today);
    setStartDate(oneMonthAgo);
    //console.log(oneMonthAgo)
    //console.log(today)

    const fetchHabits = async () => {
      const habitsData = await getUserHabits(user.userId);
      setHabits(habitsData);
      setLoading(false);
    };

    fetchHabits();

    const listener = habitEmitter.addListener("dataChanged", () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchHabits();
    });

    const unsubscribe = listenToHabitsTable((payload) => {
      //console.log("Change received!", payload);

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            //console.log("Tracking Display Habit INSERT");
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            //console.log("Tracking Display Habit UPDATE");
            setHabits((prevHabits) =>
              prevHabits.map((habit) =>
                habit.id === payload.new.id ? payload.new : habit
              )
            );
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
            //console.log("Calling getGridTrackingHistory", endDate);
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

        // Temporarily comment out setGridData and test with an empty object
        setGridData(data); // Or try: setGridData({});
      }
    };

    if (habits.length > 0) {
      fetchGridData();
    } else {
      fetchGridData();
    }

    const unsubscribe = listenToTrackingHistory((payload) => {
      //console.log("Change received in Progress!", payload);
      fetchGridData();
      switch (payload.eventType) {
        case "INSERT":
          //console.log("New Tracking Picked Up! INSERT");
        //handleRefresh(payload.habitId, payload.new);
        case "UPDATE":
          //console.log("New Tracking Picked Up! UPDATE");
        //handleRefresh(payload.habitId, payload.new);
        case "DELETE":
          //console.log("New Tracking Picked Up! DELETE");
          //handleRefresh(payload.habitId, payload.new);
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
    
    setMetrics({totalTracked, 
        consistencyPercentage: consistencyPercentage.toFixed(0),
        longestStreak,})

    return metrics
  }

  return (
    <ScrollView>
    <FlashList
      data={habits}
      keyExtractor={(item) => item.id}
      extraData={gridData}
      renderItem={({ item }) => {
        const habitData = gridData[item.id];
        return (
          <View style={{ marginBottom: 40, padding:8 }}>
            <View>
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
                        <Text style={styles.habitName}>{item.name} {item.emoji}</Text>
                        <Text>
                          {item.frequency}x {item.frequency_rate}
                        </Text>
                      </View>
                      <CalendarButton
                        label={item.name + " Year In Review"}
                        content={<HabitYearView id={item.id} />}
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
          </View>
         
        );
      }}
      estimatedItemSize={100}
      nestedScrollEnabled={true}
    />
     </ScrollView>
  );
};

export default HeatMapDisplay;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderWidth:1,
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
