import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

export interface HabitTrackingEntry {
  date: string; // Format: "YYYY-MM-DD"
  count: number;
}

interface CommitHistoryProps {
  data: HabitTrackingEntry[];
}

const CommitHistoryGrid: React.FC<CommitHistoryProps> = ({ data }) => {
  // Sort data in descending order
  const sortedData = [...data].sort((a, b) => b.date.localeCompare(a.date));

  // Group data by months (descending order)
  const groupedByMonth = sortedData.reduce<Record<string, HabitTrackingEntry[]>>(
    (acc, entry) => {
      const [year, month] = entry.date.split("-"); // Extract year and month
      const key = `${year}-${month}`; // Use "YYYY-MM" as the grouping key
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    },
    {}
  );

  const monthKeys = Object.keys(groupedByMonth).reverse(); // Reverse for descending order

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commit History</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {monthKeys.map((monthKey) => (
          <View key={monthKey} style={styles.monthContainer}>
            <Text style={styles.monthLabel}>{monthKey}</Text>
            <View style={styles.gridContainer}>
              {groupedByMonth[monthKey].map((entry) => {
                const intensity = entry.count;
                const backgroundColor =
                  intensity === 0
                    ? "#ebedf0"
                    : intensity === 1
                    ? "#c6e48b"
                    : intensity === 2
                    ? "#7bc96f"
                    : intensity === 3
                    ? "#239a3b"
                    : "#196127"; // Color based on count
                return (
                  <View
                    key={entry.date}
                    style={[styles.dayBox, { backgroundColor }]}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CommitHistoryGrid;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#3e4e88", // Primary color
  },
  monthContainer: {
    marginRight: 16,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#3e4e88",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 150, // Limit width for each month grid
  },
  dayBox: {
    width: 18,
    height: 18,
    margin: 2,
    borderRadius: 2,
  },
});
