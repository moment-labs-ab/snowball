import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import DraggableFlatList, {
    ScaleDecorator,
  } from "react-native-draggable-flatlist";
  
type MovableHabitsProps = {
    id:string,
    order:number,
    name: string
}

const MovableHabit = ({id, order, name}:MovableHabitsProps) => {
  return (
    <View style={{flexDirection:'row', justifyContent:'center', alignContent:'center',alignItems:'center', paddingBottom:2}}>
    <View
        style={styles.movingContainer}
    >
      <Text>{name} </Text>
      <Text>{order}</Text>
    </View>
    <Entypo name="menu" size={35} color="black" />    </View>
  )
}

export default MovableHabit;

const styles = StyleSheet.create({
    movingContainer:{
        borderWidth:1,
        minWidth:330,
        borderColor:'black',
        borderRadius:4,
        backgroundColor: '#edf5fe',
        minHeight: 62,
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginBottom: 16,
        overflow: 'hidden',
        paddingRight:30,
        paddingLeft:5,
        flexDirection:'row',
        alignContent:'flex-start',
        alignItems:'center'
    },

});