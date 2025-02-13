import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { useGlobalContext } from "@/context/Context";
import Toast from "react-native-toast-message";

interface DatePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate,
  onDateChange,
}) => {
  const { user } = useGlobalContext();
  const [isCalendarVisible, setCalendarVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [isPremium, setIsPremium] = useState(user.premiumUser);

  const showCalendar = () => {
    setCalendarVisibility(true);
  };

  const hideCalendar = () => {
    setCalendarVisibility(false);
  };

  const handleDayPress = (day: any) => {
    const date = moment(day.dateString)
    .startOf("day")
    .toDate();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (date < yesterday && !user.premiumUser) {
      showToast();
    }else{
    setSelectedDate(date);
    hideCalendar();
    if (onDateChange) {
      onDateChange(date);
    }
  }
  };
  const changeDate = (direction: number) => {
    const newDate = moment(selectedDate)
      .add(direction, "days")
      .startOf("day")
      .toDate();

    const today = new Date();
    today.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    if (newDate < yesterday && !user.premiumUser) {
      showToast();
    } else {
      setSelectedDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
    }
  };

  const today = new Date();

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Premium Feature",
      text2: "Unlock past Date selection with Premium!",
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

  useEffect(() => {
    setIsPremium(user.premiumUser);
  }, [user.premiumUser]);

  return (
    <View style={styles.container}>
      {/*Add in TouchableOpacity to add back calendar */}

      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <AntDesign name="left" size={20} color="#3e4e88" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={showCalendar}
          style={styles.dateTextContainer}
        >
          <Text style={styles.dateText}>
            {moment(selectedDate).format("MMMM D, YYYY")}
          </Text>
          <Text style={styles.dayText}>
            {moment(selectedDate).format("dddd")}
          </Text>
        </TouchableOpacity>

        {!moment(selectedDate).isSame(moment(today), "day") ? (
          <TouchableOpacity onPress={() => changeDate(1)}>
            <AntDesign name="right" size={20} color="#3e4e88" />
          </TouchableOpacity>
        ) : (
          <AntDesign name="right" size={20} color="#edf5fe" />
        )}
      </View>

      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCalendar}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={moment(selectedDate).format("YYYY-MM-DD")}
              onDayPress={handleDayPress}
              markedDates={{
                [moment(selectedDate).format("YYYY-MM-DD")]: {
                  selected: true,
                  marked: true,
                  selectedColor: "#3e4e88",
                },
              }}
              theme={{
                arrowColor: "#8BBDFA",
                todayDotColor: "#3e4e88",
                todayTextColor: "green",
              }}
              maxDate={today.toDateString()}
              
            />
            <TouchableOpacity onPress={hideCalendar} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
  },
  dayText: {
    fontSize: 12,
    color: "#3e4e88", // Match primary color
    marginTop: 4,
  },
  dateText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#3e4e88", // This color will now be applied correctly
  },
  dateTextContainer: {
    flex: 1,
    alignItems: "center",
    color: "#3e4e88",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "90%",
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
  },
});

export default DatePicker;
