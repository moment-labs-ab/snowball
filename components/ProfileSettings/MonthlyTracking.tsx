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

  const [displayedDays, setDisplayedDays] = useState<HabitTrackingEntry[]>([]);

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
      newSquareSize = width / 7.5; // Reduced multiplier and increased divisor
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
  
  async function getTrackingForRange(
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

    const totalDaysInRange = end.diff(start, "days") + 1;
    const expectedDates = Array.from({ length: totalDaysInRange }, (_, i) =>
      start.clone().add(i, "days").format("YYYY-MM-DD")
    );

    const rangeData = trackingData.filter((entry) =>
      moment(entry.date).isBetween(start, end, "day", "[]")
    );

    const uniqueTrackedDates = new Set(rangeData.map((entry) => entry.date));

    // If data is complete, return it with 0-padded days
    if (uniqueTrackedDates.size === totalDaysInRange) {
      setLoading(false);
      return expectedDates.map((date) => {
        const existing = rangeData.find((entry) => entry.date === date);
        return existing ?? { date, count: 0 };
      });
    }

    const isCurrentRange =
      end.isSameOrAfter(today, "day") && start.isSameOrBefore(today, "day");

    if (isCurrentRange) {
      // Pad missing days with count: 0, but not future dates
      setLoading(false);
      return expectedDates.map((date) => {
        const existing = rangeData.find((entry) => entry.date === date);
        if (moment(date).isAfter(today)) {
          return { date, count: 0 };
        }
        return existing ?? { date, count: 0 };
      });
    } else {
      // Past range – fetch from DB
      const fetchedData = await getGridTrackingHistory(
        userId,
        habitId,
        startDate,
        endDate
      );
      if (fetchedData) {
        setHabitTracking(fetchedData);
        setLoading(false);
        return expectedDates.map((date) => {
          const existing = fetchedData.find((entry) => entry.date === date);
          return existing ?? { date, count: 0 };
        });
      }
    }

    setLoading(false);
    return expectedDates.map((date) => ({ date, count: 0 })); // fallback
  }

  useEffect(() => {
    // This runs once on mount to set the initial date ranges
    const today = new Date();
    
    if (isWeekView) {
      // Set week view: 6 days before today -> today
      const weekStart = subDays(today, 6);
      setStartDate(weekStart);
      setEndDateWeek(today);
    } else {
      // Set month view
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth);
      setEndDateMonth(endOfMonth);
    }
  }, [isWeekView]);

  // Fetch data for month view
  useEffect(() => {
    const fetchMonthTracking = async () => {
      if (!isWeekView && !isLoadingTracking && tracking && tracking[habit_id]) {
        const monthData = await getTrackingForRange(
          user.userId,
          habit_id,
          tracking[habit_id],
          startDate,
          endDateMonth
        );
        setHabitTracking(monthData);
        
        // Calculate padded days for month view
        const firstDayOfMonth = moment(startDate).day(); // 0 (Sun) to 6 (Sat)
        const paddedMonthDays = [
          ...Array(firstDayOfMonth).fill({ date: null, count: null }), // Empty boxes before the first of the month
          ...monthData,
        ];
        setDisplayedDays(paddedMonthDays);
      }
    };

    // Only fetch for month view
    if (!isWeekView && startDate && endDateMonth) {
      fetchMonthTracking();
    }
  }, [tracking, isLoadingTracking, habit_id, startDate, endDateMonth, isWeekView]);

  // Fetch data for week view
  useEffect(() => {
    const fetchWeekData = async () => {
      if (isWeekView && !isLoadingTracking && tracking && tracking[habit_id]) {
        const weekStart = subDays(endDateWeek, 6);
        const weekData = await getTrackingForRange(
          user.userId,
          habit_id,
          tracking[habit_id],
          weekStart,
          endDateWeek
        );
        
        // Set week data directly (no padding needed)
        setDisplayedDays(weekData);
      }
    };

    // Only fetch for week view
    if (isWeekView && endDateWeek) {
      fetchWeekData();
    }
  }, [tracking, isLoadingTracking, habit_id, endDateWeek, isWeekView]);

  const toggleViewMode = () => {
    const today = new Date();
    
    if (isWeekView) {
      // Switch to month view
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
    
    // Clear displayed days to prevent rendering with wrong data during transition
    setDisplayedDays([]);
    setIsWeekView(!isWeekView);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const maxCount = Math.max(...(habitTracking.length > 0 ? habitTracking.map((d) => d.count) : [0]));
  const colorScale = d3
    .scaleSequential(["white", "#3e4e88"])
    .domain([0, maxCount > 0 ? maxCount : 1]);



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
          {squareSize > 0 &&
            displayedDays.map((entry, index) => {
              // Safe guard against null entries
              if (!entry || entry.date === null) {
                return (
                  <View
                    key={`empty-${index}`}
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
                  key={`day-${entry.date}-${index}`}
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
        <View
          style={{ marginTop: 15, alignItems: "center", marginBottom: 15 }}
        >
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