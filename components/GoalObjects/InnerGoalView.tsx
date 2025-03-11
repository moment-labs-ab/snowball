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
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import moment from "moment";

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
  closeModal: ()=> void;
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
  onBeforeClose
  
}: InnerGoalViewProps) => {
  const { user, isLoading } = useGlobalContext();
  const [isPremium, setIsPremium] = useState(user.premiumUser);
  const [formattedDate, setFormattedDate] = useState("")


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
    }else{
      refreshGoals()
    }
  };

  const toggleContent = ()=>{
    try {
      updateUserMilestones(user.userId, id, goalData.milestones);
      // Optional: Additional success handling
    } catch (error) {
      console.error("Failed to update milestones:", error);
      // Optional: Handle error or revert changes
    }
    closeModal()
  }

  //Accomplishing
  //Archiving
  const handleAccomplish = async (goal_id: string, user_id: string) => {
    if (!user.premiumUser){
      if(closeModal){
        closeModal()
      }
      showToast()
      return;
    }
    Alert.alert(
      "Accomplish Goal",
      "Are you sure? You will not be able to re-activate this goal.",
      [
        {
          text: "Cancel",
          //onPress: () => console.log("Accomplish canceled"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            const result = await accomplishGoal(goal_id, user_id);
            if (result.success) {
              //console.log("Goal accomplished successfully");
              // Handle successful deletion, e.g., refresh the habit list
              //deleteHabitEmitter.emit('deleteHabit')
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
        onPress: () => {
          console.log("Premium Requested!");
        }, // Navigate to your premium page
      },
    });
  };

  

  useEffect(() => {
    fetchSingleGoal();
  }, [contentToggled, habit_ids.length, milestones.length, color, name, expected_end_date]);

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
      
      <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={toggleContent}>
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
              { color: color, flex: 1, textAlign: "center" },
            ]}
          >
            {emoji} {name}
          </Text>
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
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>"{description}"</Text>
        </View >
        <View style={styles.dateContainer}>
        <Text style={styles.description}>by {moment(expected_end_date).format("MMMM D, YYYY")}</Text>
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
                  color: "black",
                  marginRight: 5,
                  flex: 1,
                  textAlign: "center",
                },
              ]}
            >
              Accomplish Goal 🎉
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    marginTop: 5,
    marginBottom: 5,
  },
  dateContainer: {
    marginTop: 5,
    marginBottom: 20,
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: 15,
    marginLeft:15,
    backgroundColor: "#edf5fe",
    height: 10,
  },
  backButton: {
    flexDirection: "row",
    position: "absolute",
    zIndex: 1,
  },
});
