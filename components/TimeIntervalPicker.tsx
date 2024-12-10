import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';

interface TimeIntervalPickerProps {
  onSave: (interval: string) => void,
  otherStyles?: string, 
  initialValue?: string
}

const TimeIntervalPicker: React.FC<TimeIntervalPickerProps> = ({ onSave, otherStyles, initialValue }) => {
  const [selectedInterval, setSelectedInterval] = useState<string>(initialValue || '');
  const [customInterval, setCustomInterval] = useState<string>('');

  const intervals = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Bi-weekly', value: 'Bi-weekly' },
    //{ label: 'Monthly', value: 'Monthly' },
    //{ label: 'Bi-monthly', value: 'Bi-monthly' },
    //{ label: 'Quarterly', value: 'Quarterly' },
    //{ label: 'Semi-annually', value: 'Semi-annually' },
    //{ label: 'Yearly', value: 'Yearly' },
  ];

  const handleValueChange = (value: string) => {
    setSelectedInterval(value);
    setCustomInterval('');
    onSave(value);
  };

  return (
    <View className={`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-black-100 font-pmedium">
         Frequency Rate</Text>
        <View className="p-5 bg-gray rounded-2xl border-2 border-black
        border-black-200 focus:border-secondary items-center mt-5 px-5">
          
        <RNPickerSelect
        onValueChange={handleValueChange}
        items={intervals}
        placeholder={{ label: 'Select an interval', value: null, color:'black'}}
        style={pickerSelectStyles}
        value={selectedInterval}
      
        Icon={() => {
            return <Ionicons name='caret-down-outline' size={38} color="black" className='flex-1 align-center'/>;
        }}
        
        />
        

    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#CDCDE0',
    borderRadius: 10,
    borderColor: 'red',
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
  },
  customTitle: {
    marginVertical: 10,
    fontSize: 16,
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
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 3
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default TimeIntervalPicker;
