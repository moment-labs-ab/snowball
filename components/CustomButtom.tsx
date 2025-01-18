import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

type CustomButtonProps = {
  title: string,
  handlePress: () => void,
  containerStyles?: string,
  textStyles?: string,
  isLoading?: boolean
  otherMethods: () => void,
  tertiaryMethods?: ()=> void
  backgroundColor?: string
}

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading, otherMethods, tertiaryMethods, backgroundColor}: CustomButtonProps) => {
  const handlingPress = ()=>{
    handlePress()
    otherMethods()
    if (tertiaryMethods) {
      tertiaryMethods();
    }
  }
  return (
    <TouchableOpacity 
    onPress={handlingPress}
    activeOpacity={0.7}
    className={`rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    style={backgroundColor ? { backgroundColor } : undefined}
    disabled={isLoading}
>
    <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
        {title}
    </Text>
</TouchableOpacity>

  )
}

export default CustomButton;