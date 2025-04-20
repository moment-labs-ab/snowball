import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  onTimeSelected: (time: Date) => void;
  initialTime?: Date;
  label?: string;
  buttonText?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  onTimeSelected,
  initialTime = new Date(),
  label = 'Select Time',
  buttonText = 'Choose Time',
}) => {
  const [selectedTime, setSelectedTime] = useState<Date>(initialTime);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  // Format time to display in 12-hour format with AM/PM
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || selectedTime;
    
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    setSelectedTime(currentDate);
    onTimeSelected(currentDate);
  };

  const showTimePicker = () => {
    setShowPicker(true);
  };

  const hideTimePicker = () => {
    setShowPicker(false);
  };

  const iosTimePicker = () => (
    <Modal
      transparent={true}
      visible={showPicker}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{label}</Text>
            <TouchableOpacity
              onPress={hideTimePicker}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            textColor="#000000" // Make sure text is visible
            style={styles.picker}
            minuteInterval={30}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={showTimePicker}
      >
        <Text style={styles.buttonText}>
          {formatTime(selectedTime)}
        </Text>
      </TouchableOpacity>
      
      {/* For Android, we display inline */}
      {Platform.OS === 'ios' ? (
        iosTimePicker()
      ) : showPicker && (
        <View style={styles.androidPickerContainer}>
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour={false}
            display="spinner" // Use spinner for better visibility on Android
            onChange={handleTimeChange}
            style={styles.picker}
            textColor="#000000" // Ensure visibility on Android
            minuteInterval={30}
          />
        </View>
      )}
      
      {/* Display the selected time more prominently below the button 
      <View style={styles.selectedTimeContainer}>
        <Text style={styles.selectedTimeLabel}>Selected Time:</Text>
        <Text style={styles.selectedTimeValue}>{formatTime(selectedTime)}</Text>
      </View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  picker: {
    height: 200,
    width: '100%',
  },
  androidPickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bae7ff',
  },
  selectedTimeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 5,
  },
  selectedTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
});

export default TimePicker;