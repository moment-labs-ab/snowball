import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import GoalHabitsView from "./GoalHabitsView";
import { Milestones } from "@/types/types";
import MilestoneList from "./MilestoneList";
import EditGoalButton from "./EditGoalButton";
import EditGoalForm from "./EditGoalForm";
import { Goal } from "@/types/types";
import {
  accomplishGoal,
  getUserSingleGoal,
  updateUserMilestones,
} from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { useGoalContext } from "@/context/GoalContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import moment from "moment";
import { useHabitContext } from "@/context/HabitContext";

interface SelectedHabits {
  id: string;
  name: string;
}
type InnerGoalViewProps = {
  id: string;
  created_at: Date;
  name: string;
  emoji: string;
  habit_ids: SelectedHabits[];
  tags: Record<string, string>;
  description: string;
  expected_end_date: Date;
  milestones: Milestones[];
  color: string;
  accomplished: boolean;
  archived: boolean;
  accomplished_at: Date;
  archived_at: Date;
  contentToggled: boolean;
  refreshGoals: () => Promise<void>;
  closeModal: () => void;
  onBeforeClose?: () => Promise<void>;
};

const InnerGoalView = ({
  id,
  created_at,
  name,
  emoji,
  habit_ids,
  tags,
  description,
  expected_end_date,
  milestones,
  color,
  accomplished,
  archived,
  accomplished_at,
  archived_at,
  contentToggled,
  refreshGoals,
  closeModal,
  onBeforeClose,
}: InnerGoalViewProps) => {
  const { user, isLoading } = useGlobalContext();
  const { setGoals } = useGoalContext();
  const [isPremium, setIsPremium] = useState(user.premiumUser);
  const [formattedEndDate, setFormattedEndDate] = useState<Date>();
  const [formattedStartDate, setFormattedStartDate] = useState<Date>();
  const [daysToGo, setDaysToGo] = useState<number>(0);

  const [goalData, setGoalData] = useState<Goal>({
    id,
    created_at,
    name,
    emoji,
    habit_ids,
    tags,
    description,
    expected_end_date,
    milestones,
    color,
    accomplished,
    archived,
    accomplished_at,
    archived_at,
  });

  const updateMilestones = (updatedMilestones: typeof goalData.milestones) => {
    setGoalData((prevGoalData) => ({
      ...prevGoalData, // Keep all other properties the same
      milestones: updatedMilestones, // Update the milestones
    }));
  };
  const handleCheckMilestone = async (index: number) => {
    const updatedMilestones = [...goalData.milestones];
    updatedMilestones[index].checked = !updatedMilestones[index].checked;

    updateMilestones(updatedMilestones);
  };

  const fetchSingleGoal = async () => {
    const goalData = await getUserSingleGoal(user.userId, id);
    if (goalData) {
      setGoalData(goalData);
    } else {
      refreshGoals();
    }
  };

  const toggleContent = () => {
    try {
      updateUserMilestones(user.userId, id, goalData.milestones);
      // Optional: Additional success handling
    } catch (error) {
      console.error("Failed to update milestones:", error);
      // Optional: Handle error or revert changes
    }
    closeModal();
  };

  const accomplishGoalState = (goalId: string) => {
    setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
  };

  //Accomplishing
  //Archiving
  const handleAccomplish = async (goal_id: string, user_id: string) => {
    if (!user.premiumUser) {
      showToast();
      return;
    }
    Alert.alert(
      "Accomplish Goal",
      "Are you sure? You will not be able to re-activate this goal.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            const result = await accomplishGoal(goal_id, user_id);
            if (result.success) {
              accomplishGoalState(goal_id);
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

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Premium Feature",
      text2: "Unlock Accomplishing with Premium",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {}, // Navigate to your premium page
      },
    });
  };
  const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) / oneDayMs
    );
    return days;
  };

  useEffect(() => {
    fetchSingleGoal();

    const endingDate = new Date(expected_end_date);
    setFormattedEndDate(endingDate);
    const startedDate = new Date(created_at);
    setFormattedStartDate(startedDate);
    setDaysToGo(getDaysBetweenDates(new Date(), endingDate));
  }, [
    contentToggled,
    habit_ids.length,
    milestones.length,
    color,
    name,
    expected_end_date,
    description,
    emoji,
  ]);

  const getContrastingTextColor = (bgColor: string) => {
    const hex = bgColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6 ? "#000" : "#fff"; // light bg -> black text, dark bg -> white text
  };

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={toggleContent}>
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <EditGoalButton
            label="Edit Goal"
            goalName={name}
            color={color}
            goalId={id}
            content={
              <EditGoalForm
                id={goalData.id}
                originalName={goalData.name}
                originalDescription={goalData.description}
                originalEmoji={goalData.emoji}
                originalColor={goalData.color}
                originalMilestones={goalData.milestones}
                originalTags={goalData.tags}
                original_expected_end_date={goalData.expected_end_date}
                original_habit_ids={goalData.habit_ids}
                refreshGoals={refreshGoals}
                closeModal={toggleContent}
              />
            }
          />
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
              { color: color, flex: 1, textAlign: "center" },
            ]}
          >
            {emoji} {name}
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{description}</Text>
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
          {daysToGo > 0 ? (
            <Text style={styles.description}>
              Days Left: <Text style={{ fontWeight: "500" }}>{daysToGo}</Text>{" "}
            </Text>
          ) : (
            <Text style={styles.description}>
              <Text style={{ fontWeight: "500" }}>{Math.abs(daysToGo)}</Text>
              <Text
                style={[
                  styles.description,
                  { color: "red", fontWeight: "500" },
                ]}
              >
                {" "}
                Days Overdue
              </Text>
            </Text>
          )}
        </View>
        <View
          style={{
            marginBottom: 20,
            paddingHorizontal: 20,
            borderRadius: 1,
            borderColor: "black",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <AntDesign name="dotchart" size={20} color={color} />
              <Text style={styles.label}> Habit Tracking </Text>
            </View>
            <View>
              <Text style={styles.labelKey}>
                <Text style={{ color: color }}>Tracked</Text>
                <Text style={{ color: "#bababa" }}> / </Text>
                <Text style={{ color: "#afd2fc" }}>Expected</Text>
                <Text style={{ color: "#bababa" }}> / </Text>
                <Text style={{ color: "#6f6e79" }}>Days Left</Text>
              </Text>
            </View>
          </View>
          <View style={styles.line} />
          <GoalHabitsView
            habit_ids={goalData.habit_ids}
            created_at={goalData.created_at}
            expected_end_date={goalData.expected_end_date}
            color={goalData.color}
          />
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <AntDesign name="checkcircleo" size={20} color={color} />
              <Text style={styles.label}> Milestones</Text>
            </View>
          </View>
          <View style={styles.line} />
        </View>

        <MilestoneList
          data={goalData.milestones}
          onCheckMilestone={handleCheckMilestone}
          checkmarkColor={goalData.color}
        />
      </View>
      <View style={{ paddingHorizontal: 18 }}>
        <TouchableOpacity
          onPress={() => {
            handleAccomplish(id, user.userId);
          }}
          style={[styles.archiveButton, { backgroundColor: color }]}
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
                  color: getContrastingTextColor(color),
                  marginRight: 5,
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "600",
                },
              ]}
            >
              Accomplish Goal 🎉
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default InnerGoalView;

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
    fontSize: 12,
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
    backgroundColor: "#edf5fe",
    height: 24,
    marginTop: 6,
  },
});
