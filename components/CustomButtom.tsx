import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

type CustomButtonProps = {
  title: string,
  handlePress: () => void,
  containerStyles?: string,
  textStyles?: string,
  isLoading?: boolean
  otherMethods: () => void
}

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading, otherMethods}: CustomButtonProps) => {
  const handlingPress = ()=>{
    handlePress()
    otherMethods()
  }
  return (
    <TouchableOpacity 
        onPress={handlingPress}
        activeOpacity={0.7}
        className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
    >
        <Text className={`text-white font-psemibold text-lg ${textStyles}`}>
            {title}
        </Text>
    </TouchableOpacity>
  )
}

export default CustomButton;
