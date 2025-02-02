import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

interface SettingPageProps {
  currentSettingValue: string;
  label: string;
  action?: () => void;
  content?: React.ReactNode;
  toggleContent?: () => void;
}

const SettingPage: React.FC<SettingPageProps> = ({
  currentSettingValue,
  label,
  action,
  content,
  toggleContent,
}) => {
  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={toggleContent}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { color: "black" }]}>{label}</Text>
        </View>
        {/* Add an empty View for balanced spacing */}
        <View style={styles.spacer} />
      </View>
      <View>
        {content}
      </View>
    </SafeAreaView>
  );
};

export default SettingPage;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#edf5fe",
    height: 60,
  },
  backButton: {
    width: 24, // Fixed width to match icon size
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3e4e88",
  },
  spacer: {
    width: 24, // Same width as backButton for balance
  },
});
