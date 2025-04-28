import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Entypo from '@expo/vector-icons/Entypo';

interface TimeIntervalPickerProps {
  onSave: (interval: string) => void,
  otherStyles?: string, 
  initialValue?: string
}

const TimeIntervalPicker: React.FC<TimeIntervalPickerProps> = ({ onSave, otherStyles, initialValue }) => {
  const [selectedInterval, setSelectedInterval] = useState<string>(initialValue || '');
  const [customInterval, setCustomInterval] = useState<string>('');

  const intervals = [
    { label: 'Daily', value: 'Daily', color: 'black' }, // Add color property for each item
    { label: 'Weekly', value: 'Weekly', color: 'black' },
    { label: 'Bi-weekly', value: 'Bi-weekly', color: 'black' },
  ];

  const handleValueChange = (value: string) => {
    setSelectedInterval(value);
    setCustomInterval('');
    onSave(value);
  };

  return (
    <View className={`${otherStyles}`}>
        <Text style={styles.label}>
         Frequency Rate</Text>
         <Text style={styles.miniLabel}>Pick a time frame to track on.</Text>
        <View style={styles.container}>
          
        <RNPickerSelect
  onValueChange={handleValueChange}
  items={intervals}
  placeholder={{ 
    label: 'Select an interval', 
    value: null, 
    color: 'gray',
  }}
  style={{
    ...pickerSelectStyles
  }}
  value={selectedInterval}
  Icon={() => {
    return <Entypo name="chevron-down" size={38} color="black" />
  }}
/>
        

    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,  // border-2
    borderColor: '#E6F0FA',  // border-black-200 (using a gray shade since it's likely meant to be subtle)
    marginTop: 5// mt-5 equals 20
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
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#8BBDFA',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d1d5db', // light gray
    borderRadius: 8,
    color: 'black',
    marginBottom: 3,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    color: 'black',
    marginBottom: 3,
  },
  placeholder: {
    color: '#9ca3af', // softer gray
  },
  iconContainer: {
    top: 2,
    right: 12,
  },
});


export default TimeIntervalPicker;
