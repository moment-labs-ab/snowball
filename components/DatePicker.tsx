import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { Link } from 'expo-router';

interface DatePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ initialDate, onDateChange }) => {
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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showCalendar} style={styles.dateContainer}>
        <Text className='flex-start text-secondary font-psemibold text-xl'>
          {moment(selectedDate).format('MMMM D, YYYY')}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCalendar}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={moment(selectedDate).format('YYYY-MM-DD')}
              onDayPress={handleDayPress}
              markedDates={{
                [moment(selectedDate).format('YYYY-MM-DD')]: {
                  selected: true,
                  marked: true,
                  selectedColor: '#3e4e88',
                  
                }
              }}
              theme={{
                arrowColor: '#8BBDFA',
                todayDotColor: '#3e4e88',
                todayTextColor: 'green'
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
    alignItems: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    alignItems: 'flex-start'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '90%',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default DatePicker;
