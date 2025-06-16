import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Goal } from "@/types/types";
import moment from "moment";
import GoalHabitsView from "./GoalHabitsView";
import MilestoneList from "./MilestoneList";
import { useGlobalContext } from "@/context/Context";
import { useGoalContext } from "@/context/GoalContext";
import { reactivateGoal } from "@/lib/supabase_goals";

type ArchivedGoalProps = {
  closeModal: () => void;
  goal: Goal | undefined;
};

const ArchivedGoal = ({ closeModal, goal }: ArchivedGoalProps) => {
  const { user, isLoading } = useGlobalContext();
  const { goals, setGoals } = useGoalContext();
  const [formattedEndDate, setFormattedEndDate] = useState<Date>();
  const [formattedStartDate, setFormattedStartDate] = useState<Date>();
  const [daysToGo, setDaysToGo] = useState<number>(0);
  const [archiveType, setArchiveType] = useState("");

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

  const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) / oneDayMs
    );
    return days;
  };

  const getContrastingTextColor = (bgColor: string) => {
    const hex = bgColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6 ? "#000" : "#fff"; // light bg -> black text, dark bg -> white text
  };

  const handleActivate = async (goal_id: string, user_id: string) => {
    Alert.alert(
      "Activate Goal",
      "Are you sure you want to re-activate this goal?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            const result = await reactivateGoal(goal_id, user_id, archiveType);
            if (result.success && result.data !== undefined) {
              setGoals((prevGoals) => [...prevGoals, result.data!]);
              if (closeModal) {
                closeModal();
              }
            } else {
              console.error("Error accomplishing goal:", result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: "default", // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );
  };

  useEffect(() => {
    if (goal) {
      const endingDate = new Date(goal.expected_end_date);
      setFormattedEndDate(endingDate);
      const startedDate = new Date(goal.created_at);
      setFormattedStartDate(startedDate);

      if (goal.accomplished) {
        const days = getDaysBetweenDates(
          startedDate,
          new Date(goal.accomplished_at)
        );
        setDaysToGo(days);

        setArchiveType("accomplished");
      } else if (goal.archived) {
        const days = getDaysBetweenDates(
          startedDate,
          new Date(goal.archived_at)
        );
        setDaysToGo(days);

        setArchiveType("archived");
      }
    }
  }, [goal?.name]);
  if (goal) {
    return (
      <SafeAreaView style={{ padding: 20, flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={closeModal}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.title,
                { color: goal.color, flex: 1, textAlign: "center" },
              ]}
            >
              {goal.emoji} {goal.name}
            </Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{goal.description}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.description}>
              Started:{" "}
              <Text style={{ fontWeight: "500" }}>
                {moment(formattedStartDate).format("MMMM D, YYYY")}{" "}
              </Text>
            </Text>
            <Text style={styles.description}>
              Expected End:{" "}
              <Text style={{ fontWeight: "500" }}>
                {moment(formattedEndDate).format("MMMM D, YYYY")}
              </Text>
            </Text>

            {goal.archived ? (
              <Text style={styles.description}>
                Archived on{" "}
                <Text style={{ fontWeight: "500" }}>
                  {moment(goal.archived_at).format("MMMM D, YYYY")}
                </Text>
              </Text>
            ) : goal.accomplished ? (
              <Text style={styles.description}>
                Accomplished on{" "}
                <Text style={{ fontWeight: "500" }}>
                  {moment(goal.accomplished_at).format("MMMM D, YYYY")}
                </Text>
              </Text>
            ) : (
              <></>
            )}
            <Text style={styles.description}>
              <Text>{goal.archived}</Text>
              <Text>
                {goal.archived
                  ? "📨 Archived"
                  : goal.accomplished
                  ? "🎉 Accomplished"
                  : "This goal is still active."}
              </Text>{" "}
              <Text style={{ fontWeight: "500" }}>{daysToGo} </Text>
              <Text>days after starting</Text>
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AntDesign name="dotchart" size={20} color={goal.color} />
            <Text style={styles.label}> Tracking History </Text>
          </View>
          <View
            style={{
              marginBottom: 20,
              paddingHorizontal: 20,
              borderRadius: 1,
              borderColor: "black",
            }}
          >
            <GoalHabitsView
              habit_ids={goal.habit_ids}
              created_at={goal.created_at}
              expected_end_date={goal.expected_end_date}
              color={goal.color}
            />
          </View>
          <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <AntDesign name="checkcircleo" size={20} color={goal.color} />
                <Text style={styles.label}> Milestones</Text>
              </View>
            </View>
            <View style={styles.line} />
          </View>
          <MilestoneList
            data={goal.milestones}
            onCheckMilestone={() => {}}
            checkmarkColor={goal.color}
          />

          <TouchableOpacity
            onPress={() => {
              handleActivate(goal.id, user.userId);
            }}
            style={[styles.archiveButton, { backgroundColor: goal.color}]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  {
                    color: getContrastingTextColor(goal.color),
                    marginRight: 5,
                    flex: 1,
                    textAlign: "center",
                    fontWeight: "600",
                  },
                ]}
              >
                Reactivate Goal ↪️
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } else {
    return <View></View>;
  }
};

export default ArchivedGoal;

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 2,
    marginBottom: 2,
  },
  dateContainer: {
    marginTop: 5,
    marginBottom: 20,
    flexDirection: "column",
    justifyContent: "center",
  },
  description: {
    textAlign: "center",
    fontWeight: "200",
    fontSize: 15,
  },
  label: {
    fontSize: 20,
    fontWeight: "500",
  },
  line: {
    height: 1, // You can adjust this for line thickness
    backgroundColor: "black", // Change color as needed
    alignSelf: "stretch",
    marginBottom: 14,
    marginTop: 8,
  },
  labelKey: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
    fontWeight: "600",
  },
  archiveButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    borderWidth: 2,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 15,
    marginLeft: 15,
    height: 24,
    marginTop: 6,
  },
});
