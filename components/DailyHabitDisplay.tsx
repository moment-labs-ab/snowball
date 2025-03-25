import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Habit } from "@/types/types";
import { getUserHabits } from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import { useHabitContext } from "@/context/HabitContext";
import HabitCard from "./HabitCard";
import { FlashList } from "@shopify/flash-list";
import HabitsWelcome from "./HabitsWelcome";
import Entypo from "@expo/vector-icons/Entypo";

type dailyHabitDisplayProps = {
  selectedDate: Date;
  editHabitOrder: boolean;
};

const DailyHabitDisplay = ({
  selectedDate,
  editHabitOrder,
}: dailyHabitDisplayProps) => {
  const {habits, setHabits, isLoading, setLoading} = useHabitContext()
  const { user } = useGlobalContext();
  //const [habits, setHabits] = useState<Habit[]>([]);
  //const [loading, setLoading] = useState<boolean>(true);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({
    Daily: true,
    Weekly: true,
    "Bi-weekly": true,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const fetchHabits = async () => {
    setLoading(true);
    const habitsData = await getUserHabits(user.userId);
    setHabits(habitsData);
    setLoading(false);
  };

  useEffect(() => {
    
  }, [user.userId, selectedDate, habits.length]);

  if (!isLoading && habits.length === 0) {
    return <HabitsWelcome />;
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
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

  return (
    <FlashList
      data={orderedGroups}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => {
        const groupHabits = groupedHabits[item.key];
        if (!groupHabits || groupHabits.length === 0) return null;

        return (
          <View>
            <TouchableOpacity
              onPress={() => toggleGroup(item.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: 'flex-start',
                paddingHorizontal:15,
                marginBottom:8
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
                {groupHabits.map((habit) => (
                  <View key={habit.id} style={{ flexDirection: "row" }}>
                    <HabitCard
                      id={habit.id}
                      name={habit.name}
                      frequency={habit.frequency}
                      frequency_rate={habit.frequency_rate}
                      created_at={habit.created_at}
                      reminder={habit.reminder}
                      frequency_rate_int={habit.frequency_rate_int}
                      date={selectedDate}
                      emoji={habit.emoji}
                      fetchHabits={fetchHabits}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }}
      estimatedItemSize={80}
    />
  );
};

export default DailyHabitDisplay;
