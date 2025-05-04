import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { HabitTrackingEntry } from "@/types/types";
import dayjs from "dayjs";

interface HeatMapStatsProps {
  data: HabitTrackingEntry[];
}

type metrics = {
  totalTracked: number;
  consistencyPercentage: string;
  longestStreak: number;
};
const HeatMapStats = ({ data }: HeatMapStatsProps) => {
  const entriesKey = data
    .map((entry) => `${entry.date}:${entry.count}`)
    .join("|");

  useEffect(() => {}, [entriesKey, data]);
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

    return {
      totalTracked,
      consistencyPercentage: consistencyPercentage.toFixed(0),
      longestStreak,
    };
  }

  const metrics = calculateMetrics(data);

  return (
    <View >
      {metrics ? (
        <View style={styles.statsContainer}>
          <View style={styles.metricContainer}>
            <Text style={styles.metric}>❄️{metrics.totalTracked}</Text>
            <Text style={styles.metricText}> Days Tracked</Text>
          </View>
          <View style={styles.metricContainer}>
            <Text style={styles.metric}>🔥{metrics.longestStreak} Days</Text>
            <Text style={styles.metricText}> Longest Streak</Text>
          </View>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default HeatMapStats;
const styles = StyleSheet.create({
  statsContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    gap:15
  },
  metricContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
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
