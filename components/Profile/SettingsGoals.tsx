import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Goal } from "@/types/types";
import { useGlobalContext } from "@/context/Context";
import { useGoalContext } from "@/context/GoalContext";
import {
  getUserArchivedGoals,
  getUserGoals,
  deleteGoal,
} from "@/lib/supabase_goals";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Toast } from "react-native-toast-message/lib/src/Toast";

type SettingsGoalsProps = {
  toggleContent: ()=>void
}

const SettingsGoals = ({toggleContent}:SettingsGoalsProps) => {
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([]);
  const [accomplishedGoals, setAccomplishedGoals] = useState<Goal[]>([]);
  const { user } = useGlobalContext();
  const { goals, setGoals } = useGoalContext();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserGoals = async () => {
    setLoading(true);
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
    setLoading(false);
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

    setAccomplishedGoals(sortedData.filter((goal) => goal.accomplished));
    setArchivedGoals(sortedData.filter((goal) => goal.archived));
  };

  useEffect(() => {
    fetchArchivedGoals();
    fetchUserGoals();
  }, [goals]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";

    // Add timezone offset to correct the date
    const newDate = new Date(date);
    const correctedDate = new Date(
      newDate.getTime() + newDate.getTimezoneOffset() * 60000
    );

    return correctedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async (goal_id: string, user_id: string) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal and its history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await deleteGoal(goal_id, user_id);
            if (result.success) {
              showUpdateToast("deleted")
              toggleContent()

            } else {
              console.error("Error deleting goal:", result.message);
            }
          },
          style: "destructive", // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );
  };

  const showUpdateToast = (action: string) => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Goal ${action}.`,
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <View
            style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
          ></View>
          {goals.map((goal) => (
            <View
              key={goal.id}
              style={[styles.goalItem, { backgroundColor: goal.color }]}
            >
              <Text style={styles.goalName}>
                {goal.emoji} {goal.name}
              </Text>
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
          <View
            style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
          ></View>
          {accomplishedGoals.map((goal) => (
            <View
              key={goal.id}
              style={[styles.goalItem, { backgroundColor: goal.color }]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={styles.goalName}>
                    {goal.emoji} {goal.name}
                  </Text>
                  <Text style={styles.goalDate}>
                    Accomplished: {formatDate(goal.accomplished_at)}
                  </Text>
                </View>
                <View style={{ justifyContent: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      handleDelete(goal.id, user.userId);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="black"
                      style={{ marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {accomplishedGoals.length === 0 && (
            <Text style={styles.emptyMessage}>No accomplished goals</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Archived Goals</Text>
          <View
            style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
          ></View>
          {archivedGoals.map((goal) => (
           <View
           key={goal.id}
           style={[styles.goalItem, { backgroundColor: goal.color }]}
         >
           <View
             style={{
               flexDirection: "row",
               justifyContent: "space-between",
             }}
           >
             <View>
               <Text style={styles.goalName}>
                 {goal.emoji} {goal.name}
               </Text>
               <Text style={styles.goalDate}>
                 Archived: {formatDate(goal.archived_at)}
               </Text>
             </View>
             <View style={{ justifyContent: "center" }}>
               <TouchableOpacity
                 onPress={() => {
                   handleDelete(goal.id, user.userId);
                 }}
                 style={styles.deleteButton}
               >
                 <Ionicons
                   name="trash-outline"
                   size={20}
                   color="black"
                   style={{ marginLeft: 10 }}
                 />
               </TouchableOpacity>
             </View>
           </View>
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
    marginBottom: 100,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  goalItem: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "500",
  },
  goalDate: {
    fontSize: 14,
    color: "#535353",
  },
  emptyMessage: {
    color: "#666",
    fontStyle: "italic",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});
