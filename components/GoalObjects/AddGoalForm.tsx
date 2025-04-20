import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { insertNewGoal, getGoalCount } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { useHabitContext } from "@/context/HabitContext";
import { Goal } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAvoidingView, Platform } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import NewHabitButton from "@/modals/NewHabitButton";
import GoalColorPicker from "./GoalColorPicker";
import NewHabitModal from "@/modals/NewHabitModal";
import GoalSelector from "./GoalSelector";
import Toast from "react-native-toast-message";
import { useGoalContext } from "@/context/GoalContext";
import EmojiModal from "@/modals/EmojiModal";



interface SelectedHabits {
  id: string;
  name: string;
}

interface Milestones {
  milestone: string;
  checked: boolean;
  date?: Date;
}

const dummyHabits = [
  "Morning Meditation",
  "Daily Exercise",
  "Read 30 Minutes",
  "Drink Water",
  "Healthy Eating",
  "Journal Writing",
];

const AddGoalForm: React.FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  const { user, isLoading } = useGlobalContext();
  const { habits } = useHabitContext();
  const { goals, setGoals } = useGoalContext();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("❄️");
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabits[]>([]);
  const [milestones, setMilestones] = useState<Milestones[]>([]);
  const [expectedEndDate, seExpectedEndDate] = useState(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  //const [habits, setHabits] = useState<Habit[]>([]);
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<
    number | null
  >(null);
  const [color, setColor] = useState("#8BBDFA");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [isPremium, setIsPremium] = useState(user.premiumUser);
  const [goalCount, seGoalCount] = useState<number>(0);

  const fetchGoalCount = async () => {
    const count = await getGoalCount(user.userId);
    if (count) {
      seGoalCount(count);
    } else {
      seGoalCount(0);
    }
  };
  useEffect(() => {
    fetchGoalCount();
  }, []);

  const handleSubmit = async () => {
    // Create an array to track missing fields
    const missingFields: string[] = [];

    // Validate mandatory fields
    if (name.trim() === "") {
      missingFields.push("Goal Name");
    }
    if (selectedHabits.length === 0) {
      missingFields.push("Associated Habits");
    }
    if (!expectedEndDate) {
      missingFields.push("End Date");
    }

    // Check for duplicate milestones
    const milestoneNames = milestones.map((milestone) =>
      milestone.milestone.trim().toLowerCase()
    );
    const duplicateMilestones = milestoneNames.filter(
      (milestone, index) =>
        milestone !== "" && milestoneNames.indexOf(milestone) !== index
    );

    if (duplicateMilestones.length > 0) {
      Alert.alert(
        "Duplicate Milestones",
        `The following milestones are duplicated:\n\n${[
          ...new Set(duplicateMilestones),
        ].join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }

    // If any mandatory fields are missing, show an alert
    if (missingFields.length > 0) {
      Alert.alert(
        "Incomplete Goal",
        `Please complete the following fields:\n\n${missingFields.join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }

    const today = new Date();
    if (expectedEndDate < today) {
      Alert.alert("Invalid Date", `Please select a valid end date.`, [
        { text: "OK" },
      ]);
      return;
    }

    if (!user.premiumUser && goalCount >= 6) {
      if (closeModal) {
        closeModal();
      }
      showToast();
      return;
    }

    // If all validations pass, proceed with goal creation
    try {
      const result = await insertNewGoal(
        name,
        emoji,
        selectedHabits,
        user.userId,
        description,
        expectedEndDate,
        milestones,
        color,
        tags
      );
      if (result.success == false) {
        Alert.alert("Error", result.message);
      } else if (result.data) {
        const habit = result.data as Goal;
        setGoals((prevGoals) => [...prevGoals, habit])
      }
    } catch(error) {
      Alert.alert("Submission Error", String(error));
    } finally {
      // Reset form fields
      setName("");
      setEmoji("");
      setSelectedHabits([]);
      setTags([]);
      setDescription("");

      if (closeModal) {
        closeModal();
      }
    }
  };

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Premium Feature",
      text2: "Unlock More Goals with Premium!",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      seExpectedEndDate(selectedDate);
    }
  };

  //MILESTONES
  const addMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { milestone: "", checked: false }]);
    }
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, text: string) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], milestone: text };
    setMilestones(updatedMilestones);
  };

  // Add this before the return statement
  const renderMilestones = () => (
    <View style={styles.milestoneSection}>
      <Text style={styles.label}>Milestones</Text>
      <Text style={styles.miniLabel}>
        Break your goal down into smaller steps.
      </Text>
      {milestones.map((milestone, index) => (
        <View key={index} style={styles.milestoneRow}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <TextInput
              style={styles.milestoneInput}
              value={milestone.milestone}
              onChangeText={(text) => updateMilestone(index, text)}
              placeholder="Enter milestone"
            />
          </TouchableWithoutFeedback>
          <TouchableOpacity
            //style={[styles.addRemoveButton, { backgroundColor: '#ff6b6b' }]}
            onPress={() => removeMilestone(index)}
          >
            <AntDesign name="minuscircleo" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      {milestones.length < 5 && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#CDCDE0" }]}
            onPress={addMilestone}
          >
            <Text style={{ color: color, fontSize: 15, fontWeight: "500" }}>
              Add Milestone
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleColorChange = (color: string) => {
    setColor(color);
  };

  //NEW HABIT MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  if (!habits) {
    return <View></View>;
  } else {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container}>
          <View style={{ marginBottom: 5 }}>
            <Text style={styles.label}>Goal Name</Text>
            <Text style={styles.miniLabel}>Keep it short & powerful.</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <EmojiModal emoji={emoji} handleEmojiSelect={handleEmojiSelect} color={color} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  borderRadius: 5,
                }}
                value={name}
                onChangeText={setName}
                placeholder="Make your own or Choose One."
                placeholderTextColor={"#898989"}
                textAlignVertical="center"
              />
            </View>

          </View>
          <GoalSelector setName={setName} selectedColor={color} />

          <View style={{ marginBottom: 5, marginTop: 5 }}>
            <Text style={styles.label}>Add a Description for your Goal</Text>
            <Text style={styles.miniLabel}>Just so you don't forget.</Text>
          </View>
          <View style={styles.descriptionRow}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  borderRadius: 5,
                  width: "100%",
                }}
                value={description}
                onChangeText={setDescription}
                placeholder="Be as descriptive as possible."
                placeholderTextColor={"#898989"}
                textAlignVertical="center"
              />
            </TouchableWithoutFeedback>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Associate Habits:</Text>
            <Text style={styles.miniLabel}>
              What habits will help you accomplish this goal?
            </Text>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitItem}
                onPress={() => {
                  setSelectedHabits(
                    selectedHabits.some((h) => h.id === habit.id)
                      ? selectedHabits.filter((h) => h.id !== habit.id)
                      : [...selectedHabits, { id: habit.id, name: habit.name }]
                  );
                }}
              >
                <Text>{habit.emoji} {habit.name}</Text>
                {selectedHabits.some((h) => h.id === habit.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <View style={{ padding: 10, flexDirection: "row" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text>Create a New Habit</Text>
                <NewHabitButton
                  content={
                    <NewHabitModal
                      visible={modalVisible}
                      onClose={handleCloseModal}
                      title={"Create a New Habit"}
                    />
                  }
                  style={{ height: 30, width: 30, backgroundColor: color }}
                />
              </View>
            </View>
          </View>

          {renderMilestones()}

          <View>
            <Text style={styles.label}>Expected End Date</Text>
            <Text style={styles.miniLabel}>
              When do you want to accomplish this goal?
            </Text>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={
                    activeMilestoneIndex !== null
                      ? milestones[activeMilestoneIndex].date || new Date()
                      : expectedEndDate
                  }
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  accentColor={color}
                  //style={{ backgroundColor: 'black', paddingInlineStart:10}}
                />
              </View>
            </View>
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text style={styles.label}>Goal Color</Text>
            <GoalColorPicker
              selectedColor={color}
              onColorChange={handleColorChange}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: color }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textArea: {
    height: 80,
    borderRadius: 5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  description: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 20,
    marginRight: 10,
    height: 120, // Specify height for the TextInput
    textAlignVertical: "top", // Align text to the top of the box
    borderRadius: 5,
  },
  emojiButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#CDCDE0",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
  },
  habitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  checkmark: {
    color: "green",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#e0e0e0",
    padding: 5,
    margin: 2,
    borderRadius: 5,
  },
  addButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#CDCDE0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#3e4e88",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 200,
    width: "100%",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  closeButton: {
    alignSelf: "center",
    paddingBottom:10
  },
  milestoneSection: {
    marginVertical: 8,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
  },
  milestoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  addRemoveButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
    minWidth: 90,
    alignItems: "center",
  },
  dateSection: {
    marginVertical: 15,
  },
  datePicker: {
    justifyContent: "center",
    //backgroundColor:"#8BBDFA",
    borderRadius: 10,
    alignContent: "center",
    alignItems: "center",
    borderColor: "black",
  },
  pickerContainer: {
    backgroundColor: "#CDCDE0",
    alignItems: "center",
    borderRadius: 5,
    width: "100%",
  },
  picker: {
    width: "100%",
  },
  colorButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  colorButtonText: {
    color: "white",
    fontWeight: "500",
  },
  colorPickerContainer: {
    height: 350,
    padding: 20,
  },
  newHabitContainer: {
    borderColor: "#3e4e88",
    width: "50%",
    backgroundColor: "#3e4e88",
    height: 35,
    justifyContent: "center",
    borderRadius: 5,
    textAlign: "center",
    alignItems: "center",
  },
  miniLabel: {
    fontSize: 13,
    fontWeight: "200",
    marginBottom: 5,
    paddingLeft: 2,
  },
});

export default AddGoalForm;
