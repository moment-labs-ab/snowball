import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    useWindowDimensions,
    ActivityIndicator,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { useTrackingContext } from "@/context/TrackingContext";
  import { HabitTrackingEntry } from "@/types/types";
  import { useGlobalContext } from "@/context/Context";
  import moment from "moment";
  import { getGridTrackingHistory } from "@/lib/supabase_progress";
  import * as d3 from "d3-scale";
  import MonthPicker from "./MonthPicker";
  import HeatMapStats from "./HeatMapStats";
  
  interface MonthlyTrackingProps {
    habit_name: string;
    habit_emoji: string;
    habit_id: string;
  }
  
  const MonthlyTracking = ({
    habit_name,
    habit_emoji,
    habit_id,
  }: MonthlyTrackingProps) => {
    const { tracking, isLoadingTracking } = useTrackingContext();
    const { user } = useGlobalContext();
    const [habitTracking, setHabitTracking] = useState<HabitTrackingEntry[]>([]);
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [startDate, setStartDate] = useState<Date>(new Date());
    const { width, height } = useWindowDimensions();
    const [layoutMode, setLayoutMode] = useState("iPhonePortrait")
    const [loading, setLoading] = useState(false)
  
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
  
    async function getTrackingForMonth(
      userId: string,
      habitId: string,
      trackingData: HabitTrackingEntry[],
      startDate: Date,
      endDate: Date
    ): Promise<HabitTrackingEntry[]> {
      setLoading(true)
      const start = moment(startDate);
      const end = moment(endDate);
      const today = moment();
  
      const totalDaysInMonth = end.diff(start, "days") + 1;
      const expectedDates = Array.from({ length: totalDaysInMonth }, (_, i) =>
        start.clone().add(i, "days").format("YYYY-MM-DD")
      );
  
      const monthData = trackingData.filter((entry) =>
        moment(entry.date).isBetween(start, end, "day", "[]")
      );
  
      const uniqueTrackedDates = new Set(monthData.map((entry) => entry.date));
  
      // If data is incomplete
      if (uniqueTrackedDates.size < totalDaysInMonth) {
        const isCurrentMonth =
          start.isSame(today, "month") && start.isSame(today, "year");
  
        if (isCurrentMonth) {
          return expectedDates.map((date) => {
            const existing = monthData.find((entry) => entry.date === date);
            if (moment(date).isAfter(today)) {
              return { date, count: 0 };
            }
            return existing ?? { date, count: 0 };
          });
        } else {
          // Past month – fetch from DB
          const fetchedData = await getGridTrackingHistory(
            userId,
            habitId,
            startDate,
            endDate
          );
          if (fetchedData) {
            setHabitTracking(fetchedData);
            return fetchedData;
          }
        }
      }
  
      // If all days are covered, return sorted
      return expectedDates.map((date) => {
        const entry = monthData.find((d) => d.date === date);
        return entry ?? { date, count: 0 };
      });
    }
  
    useEffect(() => {
      // This runs once on mount to set the initial month range
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    }, []);
  
    useEffect(() => {
      // This refetches when date range changes
      const fetchTracking = async () => {
          setLoading(true)
        if (!isLoadingTracking && tracking && tracking[habit_id]) {
          const monthData = await getTrackingForMonth(
            user.userId,
            habit_id,
            tracking[habit_id],
            startDate,
            endDate
          );
          setHabitTracking(monthData);
          setLoading(false)
        }
      };
  
      if (startDate && endDate) {
        fetchTracking();
      }
    }, [tracking, isLoadingTracking, habit_id, startDate, endDate]);
  
    useEffect(() => {
      //console.log("Updated tracking for", habit_name, habitTracking);
      const layoutMode = getLayoutMode(width, height);
      setLayoutMode(layoutMode)
    }, [habitTracking, width, height]);
  
    //Calendar Grid
    
    const screenWidth = useWindowDimensions().width;
    const getLayoutMode = (width: number, height: number) => {
      if (width >= 1024 && width > height) return "iPadLandscape";
      if (width >= 768 && height > width) return "iPadPortrait";
      return "iPhonePortrait";
    };
  
    
  
    let squareSize: number;
  
    switch (layoutMode) {
      case "iPadLandscape":
        squareSize = (width ) / 10; // generous spacing, 10 columns fit
        break;
      case "iPadPortrait":
        squareSize = ((width -20 ) / 6) * 1.1; // 8 columns, tighter but clean
        break;
      default: // iPhonePortrait
        squareSize = (width) / 8; // exactly 7 days of the week
        break;
    }
  
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDayOfMonth = moment(startDate).day(); // 0 (Sun) to 6 (Sat)
  
    const maxCount = Math.max(...habitTracking.map((d) => d.count));
    const colorScale = d3
      .scaleSequential(["white", "#3e4e88"])
      .domain([0, maxCount]);
  
    const paddedDays = [
      ...Array(firstDayOfMonth).fill(null), // Empty boxes before the first of the month
      ...habitTracking,
    ];
  

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.habitName}>
          {habit_emoji} {habit_name}
          </Text>
          <MonthPicker onMonthChange={handleMonthSelection} />
        </View>
  
        {/* Weekday labels */}
        <View
          style={[
            styles.weekdayRow,
            { paddingHorizontal: layoutMode === "iPhonePortrait" ? 8 :8},
          ]}
        >
          {daysOfWeek.map((day, i) => (
            <Text
              key={i}
              style={{
                width: squareSize,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 10,
              }}
            >
              {day}
            </Text>
          ))}
        </View>
  
        {/* Main content container to push stats to bottom */}
        <View style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Calendar grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: 4,
              justifyContent: "flex-start",
              
            }}
          >
            {paddedDays.map((entry, index) => {
              if (!entry) {
                return (
                  <View
                    key={index}
                    style={{
                      width: squareSize,
                      height: squareSize,
                      margin: 2,
                    }}
                  />
                );
              }
  
              const date = moment(entry.date);
              const color = colorScale(entry.count);
              const isToday = date.isSame(moment(), "day");
              const showWhiteText = entry.count > 0;
  
              return (
                <View
                  key={entry.date}
                  style={{
                    width: squareSize,
                    height: squareSize,
                    margin: 2,
                    backgroundColor: color,
                    borderRadius: 4,
                    justifyContent: "flex-end",
                    padding: 4,
                    borderWidth: isToday ? 2 : .4,
                    borderColor: isToday ? "#acc936" : undefined,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: showWhiteText ? "white" : "#333",
                    }}
                  >
                    {date.date()}
                  </Text>
                </View>
              );
            })}
          </View>
  
          {/* bottom stats */}
          <View style={{ marginTop: 15, alignItems: "center", marginBottom: 15 }}>
            <HeatMapStats data={habitTracking} />
          </View>
        </View>
      </View>
    );
  };
  
  export default MonthlyTracking;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderWidth: 2,
      borderRadius: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignContent: "center",
      alignItems: "flex-end",
      marginBottom: 20,
      padding: 10,
    },
    weekdayRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    habitName: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#8BBDFA",
    },
  });