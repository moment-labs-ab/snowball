import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert
} from "react-native";
import React, { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { archiveGoal, deleteGoal } from "@/lib/supabase_goals";
import { useGlobalContext } from "@/context/Context";
import Octicons from '@expo/vector-icons/Octicons';
import { goalEmitter } from "@/events/eventEmitters";

interface GoalButtonProps {
  label: string;
  goalName: string;
  goalId: string,
  color?: string;
  action?: () => void;
  content?: React.ReactNode;
  onClose?: () => void; // Optional callback to handle closing
}

const EditGoalButton: React.FC<GoalButtonProps> = ({
  label,
  goalName,
  goalId,
  color,
  action,
  content,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const {user} = useGlobalContext();


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

  const handleDelete = async (goal_id: string, user_id:string)=>{
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal and its history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Delete canceled'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const result = await deleteGoal(goal_id, user_id);
            if (result.success) {
              console.log('Goal deleted successfully');
              
              // Handle successful deletion, e.g., refresh the habit list
              goalEmitter.emit('deleteGoal')
            } else {
              console.error('Error deleting goal:', result.message);
            }
          },
          style: 'destructive', // Optional: gives a red color to the button on iOS
        },
      ],
      { cancelable: true } // Allows the alert to be dismissed by tapping outside of it
    );

  }

  
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleContent}>
          <Feather name="edit" size={20} color="black" />
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
              <Text style={[styles.headerText, {color:color}]}>
                {label} {" "}
              </Text>
              <TouchableOpacity onPress={()=>{handleDelete(goalId, user.userId)}}
          style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={28} color="red" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
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
    justifyContent: "space-between", // Ensures even spacing between elements
    padding: 16,
    backgroundColor: "#edf5fe",
    height: 60,
  },
  backButton: {
    justifyContent: "center", // Centers the content inside the back button
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: "black",
  },
  headerText: {
    flex: 1, // Allows the text to expand and take up remaining space
    textAlign: "center", // Centers the text within its allocated space
    fontSize: 20,
    fontWeight: "600",
    color: "#3e4e88",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#edf5fe",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "#3e4e88", // Replace with bg-secondary class color if different
    borderRadius: 999, // Makes it circular
    width: 48, // Equivalent to w-12
    height: 48, // Equivalent to h-12
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
});

export default EditGoalButton;
