import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import FormField from "@/components/FormField";
import Modal from "react-native-modal";
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
}
//export const newHabitEmitter = new EventEmitter();

const NewHabit: React.FC<NewHabitProps> = ({ visible, onClose, title }) => {
  const [frequency, setFrequency] = useState<number>(1);
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const { user } = useGlobalContext();

  const [habit, setHabit] = useState({
    name: "Habit",
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
    }
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
    <Modal
      isVisible={visible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ margin: 0, justifyContent: "flex-end", flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#E6F0FA",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 75,
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
          <TouchableOpacity
            onPress={closeHabits}
            style={{
              alignSelf: "flex-start",
              marginBottom: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            {title}
          </Text>

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
    </Modal>
  );
};

export default NewHabit;
