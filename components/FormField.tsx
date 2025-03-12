import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

import Feather from "@expo/vector-icons/Feather";

type FormFieldProps = {
  title: string;
  value?: string;
  placeholder?: string;
  handleChangeText: (e: string) => void;
  otherStyles: string;
  keyboardType?: string;
};

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="w-full h-16 px-4 bg-gray-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 5,
            borderRadius: 5,
            flex:1,
            fontSize:18
          }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          textAlignVertical="center"
          secureTextEntry={title === "Password" && !showPassword}
        />
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {!showPassword ? (
              <Feather name="eye-off" size={24} color="black" />
            ) : (
              <Feather name="eye" size={24} color="black" />

            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
