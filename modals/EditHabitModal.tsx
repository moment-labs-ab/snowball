import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import NumberInput from "@/components/NumberInput";
import TimeIntervalPicker from "@/components/TimeIntervalPicker";
import {
  deleteHabit,
  updateHabitIfChanged,
  updateTracking,
  archiveHabit,
} from "@/lib/supabase_habits";
import { useGlobalContext } from "@/context/Context";
import Ionicons from "react-native-vector-icons/Ionicons";
import NumberBox from "@/components/NumberBox";
import Octicons from "@expo/vector-icons/Octicons";
import EmojiSelector from "react-native-emoji-selector";
import Toast from "react-native-toast-message";
import { useHabitContext } from "@/context/HabitContext";
import { Habit } from "@/types/types";
import { getTrackingCountDates } from "@/lib/supabase_habits";
import EmojiModal from "./EmojiModal";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import AntDesign from '@expo/vector-icons/AntDesign';


interface EditHabitProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  habit_id: string;
  selectedDate: Date;
  trackingCount: number;
  onTrackingCountChange: (newTrackingCount: number) => void;
  singleDayCount: number;
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
  singleDayCount,
  closeModal,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState("#3e4e88");
  const [name, setName] = useState("Habit");
  const [frequencyRate, setFrequencyRate] = useState("Daily");
  const [reminder, setReminder] = useState(false);
  const [emoji, setEmoji] = useState("");

  const [habit, setHabit] = useState<Habit>({} as Habit);

  const { user } = useGlobalContext();
  const { habits, isLoading, setHabits } = useHabitContext();
  const [habitNames, setHabitNames] = useState<string[]>([]);
  const [tracking, setTrackingCount] = useState<number>(singleDayCount);
  const [isPremium, setIsPremium] = useState(user.premiumUser);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const formatDate = (input: Date | string) => {
    const date =
      typeof input === "string" ? new Date(input + "T00:00:00") : input;
    return moment(input).format("M/DD");

    
  };

  const fetchTimeFrameDates = async () => {
    const dates = await getTrackingCountDates(
      habit_id,
      user.userId,
      selectedDate
    );
    if (dates) {
      setEndDate(formatDate(dates.time_frame_end));
      setStartDate(formatDate(dates.time_frame_start));
    }
  };
  useEffect(() => {
    if (visible) {
      setTrackingCount(trackingCount);
    }

    fetchTimeFrameDates();
  }, [visible, trackingCount]);

  const getHabitById = (habitId: string) => {
    setLoading(true);
    const habit = habits.find((habit) => habit.id === habitId);

    const names = habits.map((habit) => habit.name);
    setHabitNames(names);
    return habit;
  };

  useEffect(() => {
    const habit_data = getHabitById(habit_id);
    if (habit_data) {
      setHabit(habit_data);
      setLoading(false);
    }
  }, [user.userId, habit_id]);

  const [isSubmitting, setisSubmitting] = useState(false);
  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === updatedHabit.id ? { ...habit, ...updatedHabit } : habit
      )
    );
  };

  const deleteHabitState = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.filter((habit) => habit.id !== habitId)
    );
  };
  const submit = async () => {
    if (habit.name === "Habit" || habit.frequency === 0) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }
    if (habitNames.includes(habit.name) && habit.name != title) {
      Alert.alert(
        "Duplicate Habit Name",
        `You already have a habit called ${habit.name}.`,
        [{ text: "OK" }]
      );
      return;
    }
    if (habit.name.length > 18) {
      Alert.alert(
        "Name too long.",
        "Habit name must be 18 characters or less.",
        [{ text: "OK" }]
      );
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
      } else if (result.data) {
        const habit = result.data as Habit;
        updateHabit(habit);
        showUpdateToast("updated");
      }

      // Update tracking count if changed
      if (singleDayCount !== tracking) {
        //console.log("Calling updateTracking...")
        const result = await updateTracking(
          user.userId,
          habit_id,
          selectedDate,
          -(singleDayCount - tracking)
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
              deleteHabitState(habit_id);
              showUpdateToast("deleted");
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
  };

  //Archiving
  const handleArchive = async (habit_id: string, user_id: string) => {
    if (!user.premiumUser) {
      if (closeModal) {
        closeModal();
      }
      showToast();
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
              closeHabits();
              showUpdateToast("archived");
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
        onPress: () => {}, // Navigate to your premium page
      },
    });
  };

  const showUpdateToast = (action: string) => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: `Habit ${action}.`,
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
          //console.log("Premium Requested!");
        }, // Navigate to your premium page
      },
    });
  };

  useEffect(()=>{

  }, [visible])

  //Modal Logic
  const [isVisible, setIsVisible] = useState(visible);
  const toggleContent = () => {
    setIsVisible(!isVisible);
};

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  }

  return (
    <ScrollView style={{
      flex: 1,
      
    }}>
      <SafeAreaView
        
      >
        <Modal
                  visible={visible}
                  animationType="slide"
                  onRequestClose={onClose}
                  presentationStyle='pageSheet'
                  
              >
                <View style={styles.headerContainer}>
                          <TouchableOpacity 
                              style={styles.backButton}
                              onPress={onClose}
                          >
                              <AntDesign name="close" size={24} color="black" />
                              
                          </TouchableOpacity>
                          <Text style={styles.headerText}>{habit.name}</Text>
                      </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingVertical:20,
            
           
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
           
          </View>
          <View style={{ marginBottom: 10 }}>
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
                Tracking for <Text
                  style={{ textAlign: "center", fontSize: 16, color: "#333", fontWeight:'300' }}
                >
                  {startDate === endDate
                    ? startDate
                    : `${startDate} - ${endDate}`}
                </Text>
              </Text>
            </View>

            <NumberBox
              title="Number Tracked"
              placeholder={singleDayCount}
              handleChangeNumber={(e) => setTrackingCount(e)}
            />
          </View>

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
            <EmojiModal
              emoji={habit.emoji}
              handleEmojiSelect={handleEmojiSelect}
              height={40}
              width={40}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "black",
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
          <TimeIntervalPicker
            onSave={(e) => setHabit({ ...habit, frequency_rate: e })}
            initialValue="Daily"
            otherStyles="mt-5"
          />
          <NumberInput
            title="Frequency"
            placeholder=" "
            handleChangeText={(e) => setHabit({ ...habit, frequency: e })}
            initialValue={habit.frequency}
            otherStyles="mt-10"
          />

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 4,
            }}
          ></View>

          <View
            style={{
              marginTop: 10,
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

          <TouchableOpacity
            onPress={() => {
              submit();
            }}
            style={[styles.submitButton, { backgroundColor: "#3e4e88" }]}
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
                    color: "white",
                    marginRight: 5,
                    flex: 1,
                    textAlign: "center",
                  },
                ]}
              >
                Update Habit
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 5 }}>
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

            <TouchableOpacity
              onPress={() => handleDelete(habit_id, user.userId)}
              style={[styles.archiveButton, { borderColor: "red" }]}
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
                  Delete Habit
                </Text>
                <Ionicons
                  name="trash-outline"
                  size={28}
                  color="red"
                  style={{ marginLeft: 10 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
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
    marginTop: 15,
    width: "50%",
    borderWidth: 3,
  },
  submitButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
    borderWidth: 4,
    borderColor: "#3e4e88",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    
    borderBottomWidth:1,
    marginHorizontal:15,
    borderBottomColor:'#8BBDFA'
},
backButton: {
  flexDirection: 'row',
  position: 'absolute',
  zIndex: 1,
  marginTop:10,
},
headerText: {
  flex: 1,
  textAlign: 'center',
  fontSize: 24,
  fontWeight: 'bold',
  color: '#3e4e88',
},
});
