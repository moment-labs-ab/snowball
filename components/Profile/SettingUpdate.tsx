import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import React, { useState } from "react";
import { useGlobalContext } from "@/context/Context";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { updateUserSetting } from "@/lib/supabase_profile";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";

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
  const { isLoggedIn, setUser } = useGlobalContext();
  const [value, setValue] = useState<string>(settingValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateSetting = async () => {
    setIsSubmitting(true);
    const result = await updateUserSetting(settingId, value);
    setIsSubmitting(false);

    if(result === true){
      if (settingId == 'name'){
        setUser((prevUser)=> ({
          ...prevUser,
          name: value
        }))
      }
      else if(settingId == 'email'){
        setUser((prevUser)=> ({
          ...prevUser,
          email: value
        }))
      }
      showUpdateToast();
    }else{
      Alert.alert(`Update Failed. Please try another ${settingId}`);


    }

    isVisible(false);
  };

  const showFailToast = (settingId:string, error:string) => {
    Toast.show({
      type: "error",
      text1: `Failed to Update ${settingId}`,
      text2: error,
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  const showUpdateToast = () => {
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "User Info Updated",
      visibilityTime: 3200,
      position: "top",
      autoHide: true,
      props: {
        onPress: () => {
        }, // Navigate to your premium page
      },
    });
  };

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => isVisible(false)}
            style={styles.closeButton}
          >
            <AntDesign name="close" size={24} color="#3e4e88" />
          </TouchableOpacity>

          <Text style={styles.title}>Edit {settingName}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={`Enter new ${settingName}`}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUpdateSetting}
          >
            <Text style={styles.submitButtonText}>Update {settingName}</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3e4e88" />
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#edf5fe",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centers the text
    position: "relative", // Allows absolute positioning for the close button
    marginBottom: 20,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    left: 0, // Keeps it aligned to the left
    marginLeft: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e4e88",
    textAlign: "center",
  },
  content: {
    gap: 15,
    padding: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#3e4e88",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SettingUpdate;
