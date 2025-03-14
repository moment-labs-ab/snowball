import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import CustomButton from "@/components/CustomButtom";
import NumberInput from "@/components/NumberInput";
import TimeIntervalPicker from "@/components/TimeIntervalPicker";
import {
  deleteHabit,
  getHabit,
  updateHabitIfChanged,
  updateTracking,
  archiveHabit,
} from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import Ionicons from "react-native-vector-icons/Ionicons";
import NumberBox from "@/components/NumberBox";
import { deleteHabitEmitter, habitEmitter } from "@/events/eventEmitters";
import Octicons from "@expo/vector-icons/Octicons";
import EmojiSelector from "react-native-emoji-selector";
import Toast from "react-native-toast-message";


interface EditHabitProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  habit_id: string;
  selectedDate: Date;
  trackingCount: number;
  onTrackingCountChange: (newTrackingCount: number) => void;
  closeModal?: () => void;
}

const EditHabitModal: React.FC<EditHabitProps> = ({
  visible,
  onClose,
  title,
  habit_id,
  selectedDate,
  trackingCount,
  onTrackingCountChange,
  closeModal,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState("#3e4e88");
  const [name, setName] = useState("Habit");
  const [frequency, setFrequency] = useState<number>(1);
  const [frequencyRate, setFrequencyRate] = useState("Daily");
  const [reminder, setReminder] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] = useState(false);

  const [habit, setHabit] = useState({
    name: name,
    frequency: frequency,
    frequency_rate: frequencyRate,
    reminder: false,
    emoji: emoji,
  });

  const { user } = useGlobalContext();
  const [tracking, setTrackingCount] = useState<number>(trackingCount);
  const [isPremium, setIsPremium] = useState(user.premiumUser);


  useEffect(() => {
    if (visible) {
      setTrackingCount(trackingCount);
    }
  }, [visible, trackingCount]);

  useEffect(() => {
    //console.log("USEEFFECT: EditHabit")
    const fetchHabit = async () => {
      try {
        setLoading(true);
        const habitData = await getHabit(user.userId, habit_id);
        if (habitData) {
          setHabit(habitData);
        } else {
          setError("Habit not found");
        }
      } catch (err) {
        setError("An error occurred while fetching the habit");
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [user.userId, habit_id]);

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  const [isSubmitting, setisSubmitting] = useState(false);
  const submit = async () => {
    //console.log(tracking); // Ensure this logs the correct, updated number

    if (habit.name === "Habit" || habit.frequency === 0) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }

    setisSubmitting(true);

    try {
      //console.log(habit.emoji)
      const result = await updateHabitIfChanged(
        habit_id,
        user.userId,
        habit.name,
        habit.reminder,
        habit.frequency,
        habit.frequency_rate,
        habit.emoji
      );

      if (result.success === false) {
        //console.log(result.message);
      } else if (result) {
        habitEmitter.emit("updatedHabit");
      }

      // Update tracking count if changed
      if (trackingCount !== tracking) {
        //console.log("Calling updateTracking...")
        const result = await updateTracking(
          user.userId,
          habit_id,
          selectedDate,
          tracking
        );
        onTrackingCountChange(tracking);
      }
    } catch (error) {
      Alert.alert(String(error));
      setisSubmitting(false);
    }

    setisSubmitting(false);
    onClose(); // Close the modal after successful submission
    if (closeModal) {
      closeModal();
    }
  };

  const closeHabits = () => {
    onClose();
  };

  const handleDelete = async (habit_id: string, user_id: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit and its history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          //onPress: () => console.log('Delete canceled'),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await deleteHabit(habit_id, user_id);
            if (result.success) {
              //console.log('Habit deleted successfully');
              closeHabits();
              // Handle successful deletion, e.g., refresh the habit list
              deleteHabitEmitter.emit("deleteHabit");
            } else {
              console.error("Error deleting habit:", result.message);
              // Handle deletion error, e.g., show a message to the user
            }
          },
          style: "destructive", // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );
  };

  const handleEmojiSelect = (selectedEmoji: string) => {
    setEmoji(selectedEmoji);
    setHabit({ ...habit, emoji: selectedEmoji });
    setIsEmojiSelectorVisible(false);
  };

  //Archiving
  const handleArchive = async (habit_id: string, user_id: string) => {
    if (!user.premiumUser){
      if(closeModal){
        closeModal()
      }
      showToast()
      return;
    }
    Alert.alert(
      "Archive Habit",
      "Are you sure you want to Archive? You will not be able to re-activate this habit.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, I want to archive",
          onPress: async () => {
            const result = await archiveHabit(habit_id, user_id);
            if (result.success) {
              habitEmitter.emit("updatedHabit");
              closeHabits();
            } else {
              console.error("Error Archiving habit:", result.message);
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
      text2: "Unlock Archiving with Premium",
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

  if(loading){
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <ActivityIndicator size="large" color="#3e4e88" />
    </View>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#E6F0FA",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 10,
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            marginBottom: 25,
          }}
        >
          <Text
            style={{
              alignItems: "flex-start",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {habit.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              handleDelete(habit_id, user.userId);
            }}
            style={{
              alignSelf: "flex-end",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="trash-outline"
              size={28}
              color="red"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>

        <NumberBox
          title="Number Tracked"
          placeholder={trackingCount}
          handleChangeNumber={(e) => setTrackingCount(e)}
        />

        <View style={{ marginBottom: 5 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              marginTop: 5,
              marginBottom: 5,
              paddingLeft: 2,
            }}
          >
            Habit Name
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
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
            <Text style={{ color: "white" }}>{habit.emoji}</Text>
          </TouchableOpacity>
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
        <NumberInput
          title="Frequency"
          placeholder={String(habit.frequency)}
          handleChangeText={(e) => setHabit({ ...habit, frequency: e })}
          otherStyles="px-2 mt-3"
          initialValue={habit.frequency}
        />
        <TimeIntervalPicker
          onSave={(e) => setHabit({ ...habit, frequency_rate: e })}
          otherStyles="mt-3"
          initialValue={habit.frequency_rate}
        />

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 4,
          }}
        >
        </View>

        <View
          style={{
            marginTop: 30,
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
          title="Update"
          handlePress={submit}
          containerStyles="mt-7 px-2 bg-secondary"
          isLoading={isSubmitting}
          otherMethods={onClose}
        />
        <TouchableOpacity
          onPress={() => {
            handleArchive(habit_id, user.userId);
          }}
          style={[styles.archiveButton, { borderColor: color }]}
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
              Archive Habit
            </Text>
            <Octicons name="archive" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditHabitModal;

const styles = StyleSheet.create({
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
  archiveButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 150,
    width: "100%",
    borderWidth: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
