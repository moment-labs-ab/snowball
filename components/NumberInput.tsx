import { View, Text, TextInput } from 'react-native'
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
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black-100 font-pmedium">{title}</Text>

      <View className="w-12 h-12 px-4 bg-gray-100 rounded-lg border-2
      border-black-200 focus:border-secondary items-center flex-row">
        <TextInput
          className="flex-1 text-black font-psemibold text-base"
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

export default NumberInput
