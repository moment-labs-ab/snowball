import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Switch,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import NumberInput from "@/components/NumberInput";
import TimeIntervalPicker from "@/components/TimeIntervalPicker";
import { insertHabit, getHabitCount } from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import HabitSelector from "./HabitSelector";
import EmojiSelector from "react-native-emoji-selector";
import Toast from "react-native-toast-message";
import { useHabitContext } from "@/context/HabitContext";
import { Habit } from "@/types/types";
import EmojiModal from "./EmojiModal";

interface NewHabitProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeModal?: () => void;
}

const NewHabitModal: React.FC<NewHabitProps> = ({
  visible,
  onClose,
  title,
  closeModal,
}) => {
  const {setHabits, habits} = useHabitContext();
  const [habitNames, setHabitNames] = useState<string[]>([]);


  const [frequency, setFrequency] = useState<number>(1);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const { user } = useGlobalContext();
  const [color, setColor] = useState("#3e4e88")
  const [emoji, setEmoji] = useState("❄️")
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(user.premiumUser);
  const [habitCount, setHabitCount] = useState<number>(0)

  const [habit, setHabit] = useState({
    name: "",
    frequency: 0,
    frequency_rate: "Daily",
    reminder: false,
    emoji: "❄️"
  });

  const [isSubmitting, setisSubmitting] = useState(false);
  const submit = async () => {
    // Create an array to track missing fields
    const missingFields: string[] = [];
  
    // Validate mandatory fields
    if (habit.name.trim() === "" || habit.name === "Habit") {
      missingFields.push("Habit Name");
    }
    if (habit.frequency <= 0) {
      missingFields.push("Frequency");
    }
    if (!habit.frequency_rate) {
      missingFields.push("Frequency Rate");
    }
    if(habit.emoji === ""){
      missingFields.push("Emoji")
    }
    if (habitNames.includes(habit.name)) {
      Alert.alert(
        "Duplicate Habit Name",
        `You already have a habit called ${habit.name}.`,
        [{ text: "OK" }]
      );
      return;
    }
  
    // If any mandatory fields are missing, show an alert
    if (missingFields.length > 0) {
      Alert.alert(
        "Incomplete Habit",
        `Please complete the following fields:\n\n${missingFields.join('\n')}`,
        [{ text: "OK" }]
      );
      return;
    }
    if (!user.premiumUser && habitCount >= 6){
      if(closeModal){
        closeModal()
      }
      showToast()
      return;
    }
  
    // Existing submission logic
    setisSubmitting(true);
    try {
      const result = await insertHabit(
        user.userId,
        habit.name,
        habit.reminder,
        habit.frequency,
        habit.frequency_rate,
        habit.emoji
      );
      
      if (result.success == false) {
        Alert.alert("Error", result.message);
      } else if (result.data) {
        const habit = result.data as Habit;
        setHabits((prevHabits) => [...prevHabits, habit])
      }
    } catch (error) {
      Alert.alert("Submission Error", String(error));
    } finally {
      
      setisSubmitting(false);
      setHabit({
        name: "Habit",
        frequency: 0,
        frequency_rate: "Daily",
        reminder: false,
        emoji: '❄️'
      });
      if (closeModal) {
        closeModal();
        
      }
    }
  };


  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setHabit({ ...habit, emoji: selectedEmoji })
    setIsEmojiSelectorVisible(false);
  };

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Premium Feature",
      text2: "Unlock More Habits with Premium!",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  const fetchHabitCount = async ()=>{
    const count = await getHabitCount(user.userId);
    if(count){
      setHabitCount(count)
    }
    else{
      setHabitCount(0)
    }
    
  }

  useEffect(() => {
    setIsPremium(user.premiumUser);
    fetchHabitCount()
    const names = habits.map(habit => habit.name);
    setHabitNames(names)
  }, [user.premiumUser]);

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#E6F0FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: "#E6F0FA",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingVertical:30,
          gap:10
          
        }}
      >
        <View style={{ marginBottom: 5 }}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.miniLabel}>What action do you want to track?</Text>
        </View>

        <View style={{flexDirection:'row'}}>
        <EmojiModal color={color} emoji={habit.emoji} handleEmojiSelect={handleEmojiSelect}/>
           <View style={{flex:1}}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#E6F0F",
              padding: 10,
              borderRadius: 5,
            }}
            value={habit.name}
            onChangeText={(e) => setHabit({ ...habit, name: e })}
            placeholder="Read, Meditate, Journal ..."
            placeholderTextColor={"#898989"}
            
            textAlignVertical="center"
          />
          </View>
          
        </View>
        <HabitSelector setHabit={setHabit} />


        <TimeIntervalPicker
          onSave={(e) => setHabit({ ...habit, frequency_rate: e })}
          initialValue="Daily"
        />
        <NumberInput
          title="Frequency"
          placeholder=" "
          handleChangeText={(e) => setHabit({ ...habit, frequency: e })}
          initialValue={0}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 4,
          }}
        >
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 50,
          }}
        >
          <Text style={{ color: "gray", fontSize: 18, fontWeight: "500" }}>
            I want to{" "}
          </Text>
          <Text style={{ color: color, fontSize: 18, fontWeight: "700" }}>
            {habit.name}{" "}
          </Text>
          <Text
            style={{
              color: color,
              fontSize: 18,
              fontWeight: "700",
              marginRight: 3,
            }}
          >
            {habit.frequency}
          </Text>
          <Text
            style={{
              color: "gray",
              fontSize: 18,
              fontWeight: "500",
              marginRight: 3,
            }}
          >
            {habit.frequency === 1 ? "time" : "times"}
          </Text>
          <Text style={{ color: color, fontSize: 18, fontWeight: "700" }}>
            {habit.frequency_rate}
          </Text>
        </View>

        <CustomButton
          title="Submit"
          handlePress={submit}
          containerStyles="mt-5 px-2"
          isLoading={isSubmitting}
          otherMethods={onClose}
          backgroundColor={color}
        />
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
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
    marginBottom: 1,
    paddingLeft:2
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '200',
    marginBottom: 5,
    paddingLeft:2
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

export default NewHabitModal;
