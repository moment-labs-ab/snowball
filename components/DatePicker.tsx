import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";

interface DatePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate,
  onDateChange,
}) => {
  const [isCalendarVisible, setCalendarVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  const showCalendar = () => {
    setCalendarVisibility(true);
  };

  const hideCalendar = () => {
    setCalendarVisibility(false);
  };

  const handleDayPress = (day: any) => {
    const date = moment(day.dateString).toDate();
    setSelectedDate(date);
    hideCalendar();
    if (onDateChange) {
      onDateChange(date);
    }
  };
  const changeDate = (direction: number) => {
    const newDate = moment(selectedDate).add(direction, "days").toDate();
    setSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const today = new Date();

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
        ): (<AntDesign name="right" size={20} color="#edf5fe" />)}
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
