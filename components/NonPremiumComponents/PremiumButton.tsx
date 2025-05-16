import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import PremiumModal from "./PremiumModal";

interface PremiumButtonProps {
  label: string;
  action?: () => void;
  content?: React.ReactNode;
  onClose?: () => void; // Optional callback to handle closing
}
const PremiumButton: React.FC<PremiumButtonProps> = ({
  label,
  action,
  content,
  onClose,
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
        <TouchableOpacity onPress={toggleContent} style={styles.iconButton}>
          <View style={styles.premiumButton}>
            <Text style={styles.premiumText}>Premium</Text>
            <MaterialCommunityIcons name="crown" size={24} color="#8BBDFA" />
          </View>
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
            </View>
            <View style={styles.contentContainer}><PremiumModal toggleContent={toggleContent}/></View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  premiumButton: {
    width: 120,
    height: 35,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: "center",
    alignContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderColor: "#FAC88B",
    backgroundColor:"rgba(250, 200, 139, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 10,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: "700",
  },
  container: {
    borderTopColor: "black",
    backgroundColor:'#edf5fe'
  },
  button: {
    backgroundColor: "#bedafc",
    padding: 15,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderColor: "#8BBDFA",
    borderWidth: 0.5,
    flexDirection: "row",
  },
  buttonText: {
    color: "#3e4e88",
    fontSize: 20,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    height: 60,
    backgroundColor:'#edf5fe'
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
    fontSize: 30,
    fontWeight: "500",
    color: "#3e4e88",
  },
  contentContainer: {
    flex: 1,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
});

export default PremiumButton;
