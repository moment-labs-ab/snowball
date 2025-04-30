import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useTrackingContext } from "@/context/TrackingContext";
import { HabitTrackingEntry } from "@/types/types";
import { useGlobalContext } from "@/context/Context";
import moment from "moment";
import { getGridTrackingHistory } from "@/lib/supabase_progress";
import * as d3 from "d3-scale";
import MonthPicker from "./MonthPicker";
import HeatMapStats from "./HeatMapStats";
import CustomToggle from "../shared/CustomToggle";
import { eachDayOfInterval, subDays } from "date-fns";

interface MonthlyTrackingProps {
  habit_name: string;
  habit_emoji: string;
  habit_id: string;
}

// Layout mode types for better type safety
type LayoutMode = "iPadLandscape" | "iPadPortrait" | "iPhonePortrait";

const MonthlyTracking = ({
  habit_name,
  habit_emoji,
  habit_id,
}: MonthlyTrackingProps) => {
  const { tracking, isLoadingTracking } = useTrackingContext();
  const { user } = useGlobalContext();
  const [habitTracking, setHabitTracking] = useState<HabitTrackingEntry[]>([]);
  const [endDateMonth, setEndDateMonth] = useState<Date>(new Date());
  const [endDateWeek, setEndDateWeek] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const { width, height } = useWindowDimensions();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("iPhonePortrait");
  const [loading, setLoading] = useState(false);
  const [isWeekView, setIsWeekView] = useState(true);
  const [defaultValue, setDefaultValue] = useState(1);
  const [squareSize, setSquareSize] = useState<number>(0);

  // Calculate layout dimensions based on screen size
  const calculateLayout = (width: number, height: number) => {
    const isLandscape = width > height;
    const isTablet = Math.min(width, height) >= 768;
    
    let newLayoutMode: LayoutMode;
    let newSquareSize: number;

    if (isLandscape && isTablet) {
      newLayoutMode = "iPadLandscape";
      newSquareSize = width / 10; // Landscape iPad
    } else if (!isLandscape && isTablet) {
      newLayoutMode = "iPadPortrait";
      // Make square sizes smaller for iPad portrait mode
      newSquareSize = ((width ) / 7.5); // Reduced multiplier and increased divisor
    } else {
      newLayoutMode = "iPhonePortrait";
      newSquareSize = width / 8;
    }

    return { mode: newLayoutMode, size: newSquareSize };
  };

  // Use useLayoutEffect to ensure measurements happen before first render
  useLayoutEffect(() => {
    const { mode, size } = calculateLayout(width, height);
    setLayoutMode(mode);
    setSquareSize(size);
  }, [width, height]);

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
    );

    setStartDate(startOfMonth);
    setEndDateMonth(endOfMonth);
  };

  async function getTrackingForMonth(
    userId: string,
    habitId: string,
    trackingData: HabitTrackingEntry[],
    startDate: Date,
    endDate: Date
  ): Promise<HabitTrackingEntry[]> {
    setLoading(true);
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
    setEndDateMonth(endOfMonth);
  }, [isWeekView]);

  useEffect(() => {
    // This refetches when date range changes
    const fetchTracking = async () => {
      setLoading(true);
      if (!isLoadingTracking && tracking && tracking[habit_id]) {
        const monthData = await getTrackingForMonth(
          user.userId,
          habit_id,
          tracking[habit_id],
          startDate,
          endDateMonth
        );
        setHabitTracking(monthData);
        setLoading(false);
      }
    };

    if (startDate && endDateMonth) {
      fetchTracking();
    }
  }, [tracking, isLoadingTracking, habit_id, startDate, endDateMonth]);

  const toggleViewMode = () => {
    const today = new Date();
    if (isWeekView) {
      // Switch back to month view
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth);
      setEndDateMonth(endOfMonth);
      setDefaultValue(0);
    } else {
      // Switch to week view: 6 days before today -> today
      const weekStart = subDays(today, 6);
      setStartDate(weekStart);
      setEndDateWeek(today);
      setDefaultValue(1);
    }
    setIsWeekView(!isWeekView);
  };

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

  
  
 
    const displayedDays = isWeekView
    ? (() => {
        const days = eachDayOfInterval({
          start: subDays(endDateWeek, 6),
          end: endDateWeek,
        }).map((date) => {
          const dateString = moment(date).format("YYYY-MM-DD");
          const entry = habitTracking.find((d) => d.date === dateString);
          return entry ?? { date: dateString, count: 0 };
        });
        return days;
      })()
    : paddedDays;

    useEffect(() => {
      if (isWeekView) {
        const today = new Date();
        setEndDateWeek(today);
      }
    }, [isWeekView]);

  
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.habitName}>
          {habit_emoji} {habit_name}
        </Text>
        {isWeekView ? (
          <View style={{ alignSelf: "flex-end" }}>
            <CustomToggle
              options={["M", "W"]}
              onChange={toggleViewMode}
              defaultValue={defaultValue}
              primaryColor="#3e4e88"
              secondaryColor="#ccc"
              size="small"
            />
          </View>
        ) : (
          <MonthPicker onMonthChange={handleMonthSelection} />
        )}
      </View>
      
      {!isWeekView && (
        <View
          style={{
            alignSelf: "flex-end",
            marginBottom: 10,
            paddingHorizontal: 10,
          }}
        >
          <CustomToggle
            options={["M", "W"]}
            onChange={toggleViewMode}
            defaultValue={defaultValue}
            primaryColor="#3e4e88"
            secondaryColor="#ccc"
            size="small"
          />
        </View>
      )}

      {/* Weekday labels */}
      {!isWeekView && (
        <View
          style={[
            styles.weekdayRow,
            { paddingHorizontal: layoutMode === "iPhonePortrait" ? 8 : 8 },
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
      )}

{isWeekView && (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 4,
    }}
  >
    {displayedDays.map((entry, index) => {
      const dayLabel = moment(entry.date).format("ddd"); // "Mon", "Tue", etc.

      return (
        <Text
          key={index}
          style={{
            width: squareSize,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 10,
            marginHorizontal: 2,
          }}
        >
          {dayLabel}
        </Text>
      );
    })}
  </View>
)}

      {/* Main content container to push stats to bottom */}
      <View style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Calendar grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: isWeekView ? "nowrap" : "wrap",
            marginTop: 4,
            justifyContent: isWeekView ? "center" : "flex-start",
          }}
        >
          {squareSize > 0 && displayedDays.map((entry, index) => {
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
                  backgroundColor: entry.count === 0 ? "white" : color,
                  borderRadius: 4,
                  justifyContent: "flex-end",
                  padding: 4,
                  borderWidth: isToday ? 2 : 0.4,
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
          {!isWeekView && <HeatMapStats data={habitTracking} />}
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
    marginBottom: 2,
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