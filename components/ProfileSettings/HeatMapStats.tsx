import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { HabitTrackingEntry } from "@/types/types";
import dayjs, { Dayjs } from "dayjs";

interface HeatMapStatsProps {
  data: HabitTrackingEntry[];
}

type metricOutput = {
  totalTracked: number;
  consistencyPercentage: string;
  longestStreak: number;
};

const HeatMapStats = ({ data }: HeatMapStatsProps) => {
  const [metrics, setMetrics] = useState<metricOutput | null>(null);
  const [firstDay, setFirstDay] = useState<Dayjs | null>(null);
  const [lastDay, setLastDay] = useState<Dayjs | null>(null);

  const entriesKey = data
    .map((entry) => `${entry.date}:${entry.count}`)
    .join("|");

  useEffect(() => {
    if (!data || data.length === 0) return;

    const { firstDay, lastDay } = getFirstAndLastDays(data);
    setFirstDay(firstDay);
    setLastDay(lastDay);
  }, [entriesKey]);

  useEffect(() => {
    if (!firstDay || !lastDay) return;

    const metricData = calculateMetrics(data, firstDay, lastDay);
    setMetrics(metricData);
  }, [firstDay, lastDay, entriesKey]);

  function getFirstAndLastDays(entries: HabitTrackingEntry[]): {
    firstDay: Dayjs;
    lastDay: Dayjs;
  } {
    const sorted = [...entries].sort((a, b) =>
      dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
    );
    return {
      firstDay: dayjs(sorted[0].date).startOf("day"),
      lastDay: dayjs(sorted[sorted.length - 1].date).startOf("day"),
    };
  }

  function calculateMetrics(
    data: HabitTrackingEntry[],
    firstDay: Dayjs,
    lastDay: Dayjs
  ): metricOutput {
    let totalTracked = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    const validData = data.filter(
      (entry) =>
        (dayjs(entry.date).isAfter(firstDay) ||
          dayjs(entry.date).isSame(firstDay, 'day')) &&
        (dayjs(entry.date).isBefore(lastDay) ||
          dayjs(entry.date).isSame(lastDay, 'day'))
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

  return (
    <View>
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
    gap: 15,
  },
  metricContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
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
