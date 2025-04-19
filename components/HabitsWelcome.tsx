import { View, Text, StyleSheet } from "react-native";
import React, {useState} from "react";
import NewHabitButton from "@/modals/NewHabitButton";
import NewHabitModal from "@/modals/NewHabitModal";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const HabitsWelcome = () => {
  //MODAL LOGIC
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No Habits
        </Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Start your Snowball here </Text> 
          
        </View>
        <NewHabitButton
          label={"Create a New Habit"}
          content={
            <NewHabitModal
              visible={modalVisible}
              onClose={handleCloseModal}
              title={"Create a New Habit"}
            />
          }
          style={{width:60, height:60}}
        />
      </View>
    );
  };
  
  export default HabitsWelcome;
  
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 20, 
      alignItems: "center", 
      justifyContent:'center' 
    },
    title: {
      color: "#8BBDFA", 
      fontSize: 40, 
      fontWeight: "800" 
    },
    subtitleContainer: {
      flexDirection: "row", 
      alignItems: 'center', 
      paddingVertical:10, 
      justifyContent:'center'
    },
    subtitleText: {
      fontSize:20, 
      fontWeight:'400'
    },
    underlineText: {
      textDecorationLine:'underline', 
      textDecorationColor: "#8BBDFA"
    },
    iconButton: {
      backgroundColor: "#3e4e88", 
      borderRadius: 999, 
      width: 34, 
      height: 34, 
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
    },
  });