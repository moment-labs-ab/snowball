import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Goal } from "@/types/types";
import { useGlobalContext } from "@/context/Context";
import { getUserArchivedGoals, getUserGoals } from "@/lib/supabase_goals";
import { goalEmitter } from "@/events/eventEmitters";
import { listenToGoalsTable } from "@/lib/supabase_goals";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator } from "react-native";

const SettingsGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([]);
  const [accomplishedGoals, setAccomplishedGoals] = useState<Goal[]>([]);
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState<boolean>(true);


  const fetchUserGoals = async () => {
    setLoading(true)
    const data = await getUserGoals(user.userId);
  
    // Sort by expected_end_date first and then by name
    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.expected_end_date).getTime();
      const dateB = new Date(b.expected_end_date).getTime();
  
      // Compare dates first
      if (dateA !== dateB) {
        return dateA - dateB;
      }
  
      // If dates are the same, compare names
      return a.name.localeCompare(b.name);
    });
  
    setGoals(sortedData);
    setLoading(false)
  };

  const fetchArchivedGoals = async () => {
    const data = await getUserArchivedGoals(user.userId);

    // Sort by expected_end_date first and then by name
    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.expected_end_date).getTime();
      const dateB = new Date(b.expected_end_date).getTime();

      // Compare dates first
      if (dateA !== dateB) {
        return dateA - dateB;
      }

      // If dates are the same, compare names
      return a.name.localeCompare(b.name);
    });

    setAccomplishedGoals(sortedData.filter(goal => goal.accomplished))
    setArchivedGoals(sortedData.filter(goal => goal.archived))
  };

  useEffect(() => {
    fetchArchivedGoals();
    fetchUserGoals();

    const listener = goalEmitter.addListener("newHabitInGoals", () => {
      // Perform refresh logic
      //console.log("Event Emitter")
      fetchArchivedGoals();
    });

    const unsubscribe = listenToGoalsTable((payload) => {
      //console.log("Change received!", payload);
      fetchArchivedGoals();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            //console.log("IN INSERT");
            setGoals((prevGoals) => [...prevGoals, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            //console.log("IN UPDATE");
            setGoals((prevGoals) =>
              prevGoals.map((Goal) =>
                Goal.id === payload.new.id ? payload.new : Goal
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            //console.log("IN DELETE");
            setGoals((prevGoals) =>
              prevGoals.filter((Goal) => Goal.id !== payload.old.id)
            );
          }
          break;
      }
    });
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      //habitEmitter.emit('dataChanged');
    };
  }, [goals.length]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    // Add timezone offset to correct the date
    const newDate = new Date(date)
    const correctedDate = new Date(newDate.getTime() + newDate.getTimezoneOffset() * 60000);
    
    return correctedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
 
    return (
     <ScrollView>
      <View style={styles.container}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Goals</Text>
        <View style={{borderBottomWidth:1, borderBottomColor:'black'}}> </View>
        {goals.map(goal => (
          <View key={goal.id} style={[styles.goalItem, {backgroundColor: goal.color}]}>
            <Text style={styles.goalName}>{goal.emoji} {goal.name}</Text>
            <Text style={styles.goalDate}>
              Goal Started: {formatDate(goal.created_at)}
            </Text>
            
          </View>
        ))}
        {goals.length === 0 && (
          <Text style={styles.emptyMessage}>No active goals</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accomplished Goals</Text>
        <View style={{borderBottomWidth:1, borderBottomColor:'black'}}> </View>
        {accomplishedGoals.map(goal => (
          <View key={goal.id} style={[styles.goalItem, {backgroundColor: goal.color}]}>
            <Text style={styles.goalName}>{goal.emoji} {goal.name}</Text>
            <Text style={styles.goalDate}>
              Accomplished: {formatDate(goal.accomplished_at)}
            </Text>
            
          </View>
        ))}
        {accomplishedGoals.length === 0 && (
          <Text style={styles.emptyMessage}>No accomplished goals</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Archived Goals</Text>
        <View style={{borderBottomWidth:1, borderBottomColor:'black'}}> </View>
        {archivedGoals.map(goal => (
          <View key={goal.id} style={[styles.goalItem, {backgroundColor: goal.color}]}>
            <Text style={styles.goalName}>{goal.emoji} {goal.name}</Text>
            <Text style={styles.goalDate}>
              Archived: {formatDate(goal.archived_at)}
            </Text>
          </View>
        ))}
        {archivedGoals.length === 0 && (
          <Text style={styles.emptyMessage}>No archived goals</Text>
        )}
      </View>
    </View>
    </ScrollView>
    );

};

export default SettingsGoals;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
    marginBottom:100
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  goalItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalDate: {
    fontSize: 14,
    color: '#535353',
  },
  emptyMessage: {
    color: '#666',
    fontStyle: 'italic',
  },
});
