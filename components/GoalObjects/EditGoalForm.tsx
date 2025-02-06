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
import EmojiSelector from "react-native-emoji-selector"; // You might need to install this package
import { useGlobalContext } from "@/context/Context";
import { getUserHabits, listenToHabitsTable } from "@/lib/supabase_habits";
import { Habit } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAvoidingView, Platform } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { goalEmitter } from "@/events/eventEmitters";
import NewHabitButton from "@/modals/NewHabitButton";
import { habitEmitter } from "@/events/eventEmitters";
import GoalColorPicker from "./GoalColorPicker";
import NewHabitModal from "@/modals/NewHabitModal";
import { archiveGoal, updateGoal } from "@/lib/supabase_goals";
import Octicons from '@expo/vector-icons/Octicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';



export interface Goal {
  name: string;
  emoji: string;
  habit_names: string[];
  tags: string[];
}

interface SelectedHabits {
  id: string;
  name: string;
}

interface Milestones {
  milestone: string;
  checked: boolean;
  date?: Date;
}

type EditGoalFormProps = {
  id: string;
  originalName: string;
  originalEmoji: string;
  original_habit_ids: SelectedHabits[];
  originalTags: Object;
  originalDescription: string;
  original_expected_end_date: Date;
  originalMilestones: Milestones[];
  originalColor: string;
  refreshGoals: () => Promise<void>;
  closeModal?: () => void;
};

const EditGoalForm: React.FC<EditGoalFormProps> = ({
  id,
  originalName,
  originalEmoji,
  original_habit_ids,
  originalTags,
  originalDescription,
  original_expected_end_date,
  originalMilestones,
  originalColor,
  refreshGoals,
  closeModal,
}) => {
  const { user, isLoading } = useGlobalContext();
  const [name, setName] = useState(originalName);
  const [emoji, setEmoji] = useState(originalEmoji);
  const [selectedHabits, setSelectedHabits] =
    useState<SelectedHabits[]>(original_habit_ids);
  const [milestones, setMilestones] =
    useState<Milestones[]>(originalMilestones);
  const [expectedEndDate, setExpectedEndDate] = useState(
    original_expected_end_date
  );
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [description, setDescription] = useState(originalDescription);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<
    number | null
  >(null);
  const [color, setColor] = useState(originalColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fetchHabits = async () => {
    const data = await getUserHabits(user.userId);
    setHabits(data);
  };
  useEffect(() => {
    fetchHabits();

    const unsubscribe = listenToHabitsTable((payload) => {
      //console.log("Change received!", payload);
      fetchHabits();

      switch (payload.eventType) {
        case "INSERT":
          if (payload.new) {
            //console.log("IN INSERT");
            setHabits((prevHabits) => [...prevHabits, payload.new]);
          }
          break;
        case "UPDATE":
          if (payload.new) {
            //console.log("IN UPDATE");
            setHabits((prevHabits) =>
              prevHabits.map((habit) =>
                habit.id === payload.new.id ? payload.new : habit
              )
            );
          }
          break;
        case "DELETE":
          if (payload.old) {
            //console.log("IN DELETE");
            setHabits((prevHabits) =>
              prevHabits.filter((habit) => habit.id !== payload.old.id)
            );
          }
          break;
      }
    });

    const startingDate = new Date(original_expected_end_date);
    setExpectedEndDate(startingDate);

    return () => {
      unsubscribe();
      habitEmitter.emit("newHabitInGoals");
    };
  }, []);

  const handleSubmit = () => {
    // Create an array to track missing fields
    const missingFields: string[] = [];
  
    // Validate mandatory fields
    if (name.trim() === "") {
      missingFields.push("Goal Name");
    }
    if (selectedHabits.length === 0) {
      missingFields.push("Associated Habits");
    }
    if (description.trim() === "") {
      missingFields.push("Goal Description");
    }
    if (!expectedEndDate) {
      missingFields.push("End Date");
    }
  
    // Check for duplicate milestones
    const milestoneNames = milestones.map((milestone) => milestone.milestone.trim().toLowerCase());
    const duplicateMilestones = milestoneNames.filter(
      (milestone, index) => milestone !== "" && milestoneNames.indexOf(milestone) !== index
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
    
    const today = new Date()
    if (expectedEndDate < today){
      Alert.alert(
        "Invalid Date",
        `Please select a valid end date.`,
        [{ text: "OK" }]
      );
      return;
    }
  
    // If all validations pass, proceed with goal update
    updateGoal(
      id,
      user.userId,
      name,
      emoji,
      selectedHabits,
      description,
      expectedEndDate,
      milestones,
      color,
      tags
    );
  
    
    goalEmitter.emit("updatedGoal");
    refreshGoals();
  };
  

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsEmojiSelectorVisible(false);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpectedEndDate(selectedDate);
    }
  };

  // Add this before the return statement
  const renderMilestones = () => (
    <View style={styles.milestoneSection}>
      <Text style={styles.label}>Milestones</Text>
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
    //console.log(color)
  };

  //NEW HABIT MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  //Archiving
  const handleArchive = async (goal_id: string, user_id:string)=>{
    Alert.alert(
      'Archive Goal',
      'Are you sure you want to Archive? You will not be able to re-activate this goal.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, I want to archive',
          onPress: async () => {
            const result = await archiveGoal(goal_id, user_id);
            if (result.success) {
              //console.log('Goal archived successfully');
              // Handle successful deletion, e.g., refresh the habit list
              //deleteHabitEmitter.emit('deleteHabit')
            } else {
              console.error('Error Archiving goal:', result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: 'default', // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );

  }

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
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                backgroundColor: color,
                marginRight: 10,
              }}
              onPress={() => setIsEmojiSelectorVisible(true)}
            >
              <Text style={{ color: "white" }}>{emoji || "❄️"}</Text>
            </TouchableOpacity>

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
                placeholder="Keep it Short & Powerful"
                placeholderTextColor={"#898989"}
                textAlignVertical="center"
              />
            </View>

            <Modal
              visible={isEmojiSelectorVisible}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsEmojiSelectorVisible(false)}
                  >
                    <Text style={{ color: "white" }}>Close</Text>
                  </TouchableOpacity>
                  <EmojiSelector
                    onEmojiSelected={handleEmojiSelect}
                    columns={8}
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Associate Habits:</Text>
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
                <Text>{habit.name}</Text>
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

          <View style={{ marginBottom: 5, marginTop: 5 }}>
            <Text style={styles.label}>Add a Description for your Goal</Text>
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
                placeholder="Any Notes?"
                placeholderTextColor={"#898989"}
                textAlignVertical="center"
              />
            </TouchableWithoutFeedback>
          </View>

          {renderMilestones()}

          <View>
            <Text style={styles.label}>Expected End Date</Text>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={
                    expectedEndDate instanceof Date
                      ? expectedEndDate
                      : new Date()
                  } // Ensure the value is a Date object
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
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={[styles.submitButtonText, {marginRight:5, flex:1, textAlign:'center'}]}>Update Goal</Text>
            <SimpleLineIcons name="refresh" size={24} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>{handleArchive(id, user.userId)}}
          style={[styles.archiveButton, {borderColor: color}]}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
              <Text style={[styles.submitButtonText, {color:'black', marginRight:5, flex:1, textAlign:'center'}]}>Archive Goal</Text>
              <Octicons name="archive" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    fontSize: 17,
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
    marginBottom: 10,
    width: "100%",
  },
  archiveButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 150,
    width: "100%",
    borderWidth:4
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
    height: "60%",
  },
  closeButton: {
    alignSelf: "center",
    padding: 10,
    backgroundColor: "black",
    borderRadius: 5,
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
});

export default EditGoalForm;