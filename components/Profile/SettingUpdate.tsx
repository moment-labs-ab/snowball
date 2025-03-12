import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import CustomButton from "../CustomButtom";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { updateUserSetting } from "@/lib/supabase_profile";
import AntDesign from "@expo/vector-icons/AntDesign";

interface SettingUpdateProps {
  settingId: string;
  settingName: string;
  settingValue: string;
  isVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingUpdate: React.FC<SettingUpdateProps> = ({
  settingId,
  settingName,
  settingValue,
  isVisible,
}) => {
  const [value, setValue] = useState<string>(settingValue);
  const [isSubmitting, setisSubmitting] = useState(false);

  const handleUpdateSetting = async () => {
    setisSubmitting(true);
    const result = await updateUserSetting(settingId, value);

    setisSubmitting(false);
    if (result) {
      console.log("Setting updated successfully");
    } else {
      console.log("Failed to update setting");
    }

    isVisible(false);
  };

  if (isSubmitting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ backgroundColor: "#edf5fe", height: "100%" }}>
        <View style={styles.headerContainer}> 
        <TouchableOpacity
          onPress={() => {
            isVisible(false);
          }}
        >
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.header}>Update your {settingId}</Text>
          <Text style={styles.prompt}>Enter your new {settingId}</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={`Update your ${settingName} setting`}
            className="border border-gray-300 rounded p-2"
          />

          <CustomButton
            title={`Update ${settingName}`}
            handlePress={handleUpdateSetting}
            containerStyles="mt-7 px-5 bg-secondary"
            isLoading={isSubmitting}
            otherMethods={() => {}}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxSizing: "border-box",
    backgroundColor: "#edf5fe",
  },
  section: {
    paddingTop: 60,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  prompt: {
    fontSize: 16,
    color: "#666",
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 15,
    marginLeft: 15,
    backgroundColor: "#edf5fe",
    height: 24,
    marginTop: 20,
  },
});

export default SettingUpdate;
