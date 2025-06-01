import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from "react-native";
import React, { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";

interface GoalButtonProps {
  label?: string;
  action?: () => void;
  content?: React.ReactNode;
  onClose?: () => void; // Optional callback to handle closing
  style?: object;
}

const NewHabitButton: React.FC<GoalButtonProps> = ({
  label,
  action,
  content,
  onClose,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleContent = () => {
    setIsVisible(!isVisible);
  };

  // Custom close handler that can be passed to child content
  const handleClose = () => {
    setIsVisible(false);
    onClose && onClose();
  };

  // Clone the content to inject a close method
  const enhancedContent = React.Children.map(content, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        // @ts-ignore
        closeModal: handleClose,
      } as Partial<unknown>);
    }
    return child;
  });
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={toggleContent}
          style={[styles.iconButton, style]}
        >
          <Entypo name="plus" size={24} color="white" />
        </TouchableOpacity>

        <Modal
          visible={isVisible}
          animationType="slide"
          onRequestClose={toggleContent}
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={toggleContent}
              >
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerText}>{label}</Text>
            </View>
            <View style={styles.contentContainer}>{enhancedContent}</View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
    borderTopColor: "black",
  },
  button: {
    backgroundColor: "#bedafc",
    padding: 15,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderColor: "#8BBDFA",
    borderWidth: 2,
    flexDirection: "row",
  },
  buttonText: {
    color: "#3e4e88",
    fontSize: 20,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E6F0FA",
    height: 60,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: "black",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#3e4e88",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  iconButton: {
    backgroundColor: "#3e4e88", // Replace with bg-secondary class color if different
    borderRadius: 999, // Makes it circular
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default NewHabitButton;
