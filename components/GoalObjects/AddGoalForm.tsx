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
import { getUserHabits, listenToHabitsTable } from "@/lib/supabase_habits";
import { Habit } from "@/types/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAvoidingView, Platform } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { goalEmitter } from "@/events/eventEmitters";
import ColorPicker from 'react-native-wheel-color-picker';
import FeedbackFormComponent from "../ProfileSettings/Feedback";
import NewHabitButton from "@/modals/NewHabitButton";
import { habitEmitter } from "@/events/eventEmitters";
import GoalColorPicker from "./GoalColorPicker";
import NewHabitModal from "@/modals/NewHabitModal";


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
  checked: boolean
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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number | null>(null);
  const [color, setColor] = useState('#3e4e88');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fetchHabits = async () => {
    const data = await getUserHabits(user.userId);
    setHabits(data);
  };
  useEffect(() => {
    fetchHabits();

    const unsubscribe = listenToHabitsTable((payload) => {
      console.log('Change received!', payload);
      fetchHabits(); 

      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            console.log("IN INSERT")
              setHabits(prevHabits => [...prevHabits, payload.new]);
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            console.log("IN UPDATE")
              setHabits(prevHabits => 
                  prevHabits.map(habit => habit.id === payload.new.id ? payload.new : habit)
                );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            console.log("IN DELETE")
              setHabits(prevHabits => prevHabits.filter(habit => habit.id !== payload.old.id));
          }
          break;
      }
    });
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      habitEmitter.emit('newHabitInGoals');
    };
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
      description === ""
    ) {
      Alert.alert("Please fill out all parts of your goal.");
    } 
    else {
      insertNewGoal(
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
      setName("");
      setEmoji("");
      setSelectedHabits([]);
      setTags([]);
      setDescription("");

      if (closeModal) {
        closeModal();
      }
      goalEmitter.emit("newGoal");
    }
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setIsEmojiSelectorVisible(false);
  };

  //MILESTONES
  const addMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { milestone: "", checked:false }]);
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
            <Text style={{ color: color, fontSize: 15, fontWeight: "500" }}>
              Add Milestone
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderColorPicker = () => (
    <Modal
      visible={showColorPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.label}>Choose Color</Text>
          <View style={styles.colorPickerContainer}>
            <ColorPicker
              color={color}
              onColorChange={handleColorChange}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              row={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.submitButton, { marginTop: 20 }]}
            onPress={() => setShowColorPicker(false)}
          >
            <Text style={styles.submitButtonText}>Select Color</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
            <View
            style={{padding:10, flexDirection:'row'}}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text>Create a New Habit</Text>
              <NewHabitButton content={<NewHabitModal visible={modalVisible} onClose={handleCloseModal} title={"Create a New Habit"}/>} style={{height:30, width:30, backgroundColor:color}}/>
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
            <GoalColorPicker selectedColor={color} onColorChange={handleColorChange} />
            
          </View>

          <TouchableOpacity style={[styles.submitButton, {backgroundColor: color}]} onPress={handleSubmit}>
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
    width: "100%",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
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
    alignItems: 'center',
    marginTop: 5,
  },
  colorButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  colorPickerContainer: {
    height: 350,
    padding: 20,
  },
  newHabitContainer:{
    borderColor:'#3e4e88',
    width:"50%",
    backgroundColor:'#3e4e88',
    height:35,
    justifyContent:'center',
    borderRadius:5,
    textAlign:'center',
    alignItems:'center'
  }
  
});

export default AddGoalForm;