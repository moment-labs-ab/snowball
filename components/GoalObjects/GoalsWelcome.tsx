import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CurvedArrow from "@/VisualComponents/CurvedArrow";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AddGoalButton from "./AddGoalButton";
import AddGoalForm from "./AddGoalForm";

const GoalsWelcome = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No Goals
        </Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Start your Journey Here:</Text> 
        </View>
        <AddGoalButton label='Create a New Goal' content={<AddGoalForm />} style={{width:60, height:60}}/>

      </View>
    );
  };
  
  export default GoalsWelcome;
  
  const styles = StyleSheet.create({
    container: {
      padding: 30, 
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