import { View, Text, StyleSheet } from "react-native";
import React from "react";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';



const TrackingWelcome = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          No Habit Data{" "}
          <SimpleLineIcons name="graph" size={40} color="#3e4e88" />
        </Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>Your habit tracking data will show up here</Text>
          
          
        </View>
      </View>
    );
  };
  
  export default TrackingWelcome;
  
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
      fontWeight:'400',
      textAlign:'center'
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