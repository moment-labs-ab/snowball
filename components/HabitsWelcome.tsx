import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CurvedArrow from "@/VisualComponents/CurvedArrow";


const HabitsWelcome = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No Habits
        </Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Start your <Text style={styles.underlineText}>Snowball</Text> with the </Text> 
          <View style={styles.iconButton}>
            <Entypo name="plus" size={17} color="white" />
          </View>
          
        </View>
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