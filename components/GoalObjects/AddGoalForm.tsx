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
import { insertNewGoal } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import { getUserHabits } from "@/lib/supabase_habits";
import { Habit } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAvoidingView, Platform } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { goalEmitter } from '@/events/eventEmitters';

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
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("❄️");
  const [selectedHabits, setSelectedHabits] = useState<SelectedHabits[]>([]);
  const [milestones, setMilestones] = useState<Milestones[]>([]);
  const [expectedEndDate, seExpectedEndDate] = useState(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);
  const [habits, setHabits] = useState<Habit[]>();
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<
    number | null
  >(null);

  const fetchHabits = async () => {
    const data = await getUserHabits(user.userId);
    setHabits(data);
  };
  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSubmit = () => {
    if (
      name === "" ||
      emoji === "" ||
      selectedHabits.length === 0 ||
      description === "" ||
      milestones.length === 0
    ) {
      Alert.alert("Please fill out all parts of your goal.");
    } else {
      insertNewGoal(
        name,
        emoji,
        selectedHabits,
        user.userId,
        description,
        expectedEndDate,
        milestones,
        tags
      );
      setName("");
      setEmoji("");
      setSelectedHabits([]);
      setTags([]);
      setDescription("");

      if (closeModal) {
        closeModal();
      }
      goalEmitter.emit("newGoal")
    }
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsEmojiSelectorVisible(false);
  };

  //MILESTONES
  const addMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { milestone: "" }]);
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
      seExpectedEndDate(selectedDate);
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
            <Text style={{ color: "#3e4e88", fontSize:15, fontWeight:'500' }}>Add Milestone</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderDatePicker = () => (
    <View style={styles.dateSection}>
      <Text style={styles.label}>Expected End Date</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{expectedEndDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
    </View>
  );

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
                backgroundColor: "#3e4e88",
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
            <View style={{justifyContent:'center', alignItems:'center'}}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={
                  activeMilestoneIndex !== null
                    ? milestones[activeMilestoneIndex].date || new Date()
                    : expectedEndDate
                }
                mode="date"
                display='inline'
                onChange={handleDateChange}
                accentColor="#3e4e88"
                //style={{ backgroundColor: 'black', paddingInlineStart:10}}
              />
            </View>
          </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Goal</Text>
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
    marginBottom: 200,
    width:'100%'
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    height: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
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
    backgroundColor: '#CDCDE0',    
    alignItems:'center',
    borderRadius:5,
    width:'100%'
  },
  picker: {
    width: "100%",
  },
});

export default AddGoalForm;
