import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useState }  from 'react'

import icons from "../constants/icons";

type FormFieldProps = {
  title: string,
  value?: string,
  placeholder?: string,
  handleChangeText: (e: string) => void,
  otherStyles: string
  keyboardType?: string,
  otherProps?: Object

}

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}: FormFieldProps) => {
    const [showPassword, setShowPassword] = useState(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black-100 font-pmedium">{title}</Text>

      <View className="w-full h-16 px-4 bg-gray-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
      <TextInput
          className="flex-1 text-black font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {/** Code to implement showing or hiding password  */}
        {title === 'Password' && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image source ={!showPassword ? icons.eye : icons.eyehide}
                className = "w-6 h-6"
                resizeMode='contain'/>
                
            </TouchableOpacity>
        )}



      </View>
    </View>
  )
}

export default FormField