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
import { getUserGoals } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { FlashList } from "@shopify/flash-list";
import { Goal } from "@/types/types";
import Entypo from "@expo/vector-icons/Entypo";
import InnerGoalView from "./InnerGoalView";
import { Milestones } from "@/types/types";

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
  tags: Object;
  description: string;
  expected_end_date: Date;
  milestones: Milestones[];
  color: string;
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


    //const prettyDate = expected_end_date.toLocaleDateString('en-US', {
    //year: 'numeric',
    // month: 'long',
    // day: 'numeric',
    //});
    //setDisplayDate(prettyDate)
  }, [habit_ids]);

  const onPress = () => {
    console.log(id, name, milestones, habit_ids);
  };

  const toggleContent = () => {
    setIsVisible(!isVisible);
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
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={toggleContent}>
              <Entypo name="chevron-down" size={24} color="black" />
            </TouchableOpacity>
          </View>
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
            contentToggled={isVisible}
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
