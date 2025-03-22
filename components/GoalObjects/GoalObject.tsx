import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/Context";
import { Goal } from "@/types/types";
import InnerGoalView from "./InnerGoalView";
import { Milestones } from "@/types/types";
import {
  updateUserMilestones,
} from "@/lib/supabase_goals";

interface SelectedHabits {
  id: string;
  name: string;
}
type GoalObjectProps = {
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
  refreshGoals: () => Promise<void>;
};

type HabitIdItem = {
  id: string;
  value: any;
};

const GoalObject = ({
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
  refreshGoals
}: GoalObjectProps) => {
  const { user, isLoading } = useGlobalContext();
  const [goals, setGoals] = useState<Goal[]>();
  const [habitIdsList, setHabitIdsList] = useState<HabitIdItem[]>([]);
  const [displayDate, setDisplayDate] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const renderHabitItem = ({ item }: { item: HabitIdItem }) => (
    <View
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
    >
      <Text>Habit {item.id}</Text>
      <Text>Value: {JSON.stringify(item.value.name)}</Text>
    </View>
  );

  useEffect(() => {
    // Convert habit_ids object to an array of key-value pairs
    const habitIdsArray = Object.entries(habit_ids).map(([id, value]) => ({
      id,
      value,
    }));
    setHabitIdsList(habitIdsArray);
  }, [habit_ids, name, color, emoji]);

  const handleMilestoneSave = async (milestones_updated:boolean,user_id:string, id:string, milestones: Milestones[]) => {
    if(milestones_updated){
      try {
        await updateUserMilestones(user.userId, id, milestones);
        // Optional: Additional success handling
      } catch (error) {
        console.error("Failed to update milestones:", error);
        // Optional: Handle error or revert changes
      }

    }
    
  }

  

  const toggleContent = async () => {
    if (isVisible) {
      // If we're closing the modal, wait for any pending operations
      // The closeModal prop passed to InnerGoalView will handle the saving
      setIsVisible(false);
    } else {
      // Just open the modal
      setIsVisible(true);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={toggleContent}>
        <View style={[styles.goalContainer, { backgroundColor: color }]}>
          <View style={styles.contentContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.name}>{name}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <Modal
        visible={isVisible}
        animationType="slide"
        onRequestClose={toggleContent}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          
          <InnerGoalView
            id={id}
            created_at={created_at}
            name={name}
            emoji={emoji}
            habit_ids={habit_ids}
            tags={tags}
            description={description}
            expected_end_date={expected_end_date}
            milestones={milestones}
            color={color}
            accomplished={accomplished}
            archived={archived}
            accomplished_at={accomplished_at}
            archived_at={archived_at}
            contentToggled={isVisible}
            refreshGoals={refreshGoals}
            closeModal={toggleContent}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  goalContainer: {
    // Remove the border and add shadow properties
    borderRadius: 8,
    width: "100%",
    aspectRatio: 1,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow position
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 6, // Shadow spread
    elevation: 5, // Android shadow
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    padding: 2,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  container: {
    padding: 2,
    borderTopColor: "black",
  },
  button: {
    backgroundColor: "#bedafc",
    padding: 15,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderColor: "#8BBDFA",
    borderWidth: 2,
    flexDirection: "row",
  },
  buttonText: {
    color: "#3e4e88",
    fontSize: 20,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#edf5fe",
    height: 15,
  },
  backButton: {
    flexDirection: "row",
    position: "absolute",
    zIndex: 1,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: "black",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    flexWrap: "wrap",
  },
});

export default GoalObject;