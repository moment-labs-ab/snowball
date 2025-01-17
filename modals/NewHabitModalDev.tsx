import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform,
  Switch,
  SafeAreaView,
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import FormField from "@/components/FormField";
import NumberInput from "@/components/NumberInput";
import TimeIntervalPicker from "@/components/TimeIntervalPicker";
import { insertHabit } from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import { newHabitEmitter } from "@/events/eventEmitters";
import AntDesign from "@expo/vector-icons/AntDesign";

interface NewHabitProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  closeModal?: () => void;
}
//export const newHabitEmitter = new EventEmitter();

const NewHabitModalDev: React.FC<NewHabitProps> = ({
  visible,
  onClose,
  title,
  closeModal,
}) => {
  const [frequency, setFrequency] = useState<number>(1);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const { user } = useGlobalContext();

  const [habit, setHabit] = useState({
    name: "",
    frequency: 0,
    frequency_rate: "Daily",
    reminder: false,
  });

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  const [isSubmitting, setisSubmitting] = useState(false);
  const submit = async () => {
    if (habit.name === "Habit" || habit.frequency === 0) {
      Alert.alert("Error", "Please fill in all the fields");
    } else {
      setisSubmitting(true);
      try {
        const result = await insertHabit(
          user.userId,
          habit.name,
          habit.reminder,
          habit.frequency,
          habit.frequency_rate
        );
        if (result.success == false) {
          console.log(result.message);
        } else if (result.data) {
          console.log(result);
        }
      } catch (error) {
        Alert.alert(String(error));
        setisSubmitting(false);
      }
      setisSubmitting(false);
      setHabit({
        name: "Habit",
        frequency: 0,
        frequency_rate: "Daily",
        reminder: false,
      });
      newHabitEmitter.emit("newHabit");
      if (closeModal) {
        closeModal();
      }
    }
  };

  const closeHabits = () => {
    onClose();
    setHabit({
      name: "Habit",
      frequency: 0,
      frequency_rate: "Daily",
      reminder: false,
    });
  };

  return (
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
          padding: 20,
          backgroundColor: "#E6F0FA",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View style={{ marginBottom: 5 }}>
          <Text style={styles.label}>I want to ...</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
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

        <FormField
          title="I want to"
          placeholder="Read, Meditate, Journal ..."
          handleChangeText={(e) => setHabit({ ...habit, name: e })}
          otherStyles="px-2"
        />
        <NumberInput
          title="Frequency"
          placeholder="1"
          handleChangeText={(e) => setHabit({ ...habit, frequency: e })}
          otherStyles="px-2 mt-3"
        />
        <TimeIntervalPicker
          onSave={(e) => setHabit({ ...habit, frequency_rate: e })}
          otherStyles="px-2 mt-3"
        />

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 4,
          }}
        >
          <Text className="text-base text-black-100 font-pmedium">
            Add a Reminder{" "}
          </Text>
          <Switch
            value={habit.reminder}
            onValueChange={(value) => setHabit({ ...habit, reminder: value })}
            trackColor={{ false: "gray", true: "#8BBDFA" }}
            className="pl-2"
          />
        </View>

        <View
          style={{
            marginTop: 50,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 50,
          }}
        >
          <Text style={{ color: "gray", fontSize: 18, fontWeight: "500" }}>
            I want to{" "}
          </Text>
          <Text style={{ color: "#3e4e88", fontSize: 18, fontWeight: "700" }}>
            {habit.name}{" "}
          </Text>
          <Text
            style={{
              color: "#3e4e88",
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
          <Text style={{ color: "#3e4e88", fontSize: 18, fontWeight: "700" }}>
            {habit.frequency_rate}
          </Text>
        </View>

        <CustomButton
          title="Submit"
          handlePress={submit}
          containerStyles="mt-7 px-2 bg-secondary"
          isLoading={isSubmitting}
          otherMethods={onClose}
        />
      </View>
    </SafeAreaView>
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

export default NewHabitModalDev;
