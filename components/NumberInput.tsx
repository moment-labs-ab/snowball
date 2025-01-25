import { View, Text, TextInput, StyleSheet } from 'react-native'
import React from 'react'

type NumberInputProps = {
  title?: string,
  placeholder?: string,
  handleChangeText: (e: number) => void,
  otherStyles?: string,
  otherProps?: Object
}

const NumberInput = ({ title, placeholder, handleChangeText, otherStyles, ...props }: NumberInputProps) => {
  const handleTextChange = (text: string) => {
    const intValue = parseInt(text, 10);
    if (!isNaN(intValue)) {
      handleChangeText(intValue);
    } else {
      handleChangeText(0); // Or any other default behavior you want for non-numeric inputs
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.miniLabel}>How often do you want to track?</Text>

      <View  style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleTextChange}
          keyboardType="numeric"
          {...props}
        />
      </View>
    </View>
  )
}

export default NumberInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginBottom:15
  },
  title: {
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
  inputContainer: {
    width:'20%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E6F0F",
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:5
  },
  inputContainerFocused: {
    borderColor: '#000', // Replace with your secondary color
  },
  input: {
    flex: 1,
    padding: 0, // Remove default padding
    fontSize: 16,
    fontFamily: 'Inter-SemiBold', // Replace with your font
    color: '#000000',
  },
  // Optional states
  inputContainerError: {
    borderColor: '#FF4D4D',
  },
  inputContainerDisabled: {
    opacity: 0.7,
  },
  // If you need to handle width variations
  fullWidth: {
    width: '100%',
  },
});
