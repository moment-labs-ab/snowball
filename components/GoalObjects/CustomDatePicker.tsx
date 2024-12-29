import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateChange: (date: Date) => void;
  currentDate: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onDateChange,
  currentDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const handleConfirm = () => {
    onDateChange(selectedDate);
    onClose();
  };

  const handleDateChange = (_: any, date?: Date) => {
    if (date) setSelectedDate(date);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.headerButton}>Confirm</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    color: '#3e4e88',
    fontSize: 16,
  },
  picker: {
    height: 200,
    backgroundColor: '#FFFFFF',
  },
});

export default CustomDatePicker;