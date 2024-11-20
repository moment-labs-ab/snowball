import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { Habit } from "@/types/types";
import HabitCard from "../HabitCard";
import HabitItem from "./HabitItem";
import DraggableListHeader from "./DraggableListHeader";
interface DraggableListProps {
  habits: Habit[];
}
const DraggableList = ({ habits }: DraggableListProps) => {
  return (
    <View style={styles.listContainer}>
      <DraggableListHeader title="Edit Habit Order"/>
      <ScrollView
        contentContainerStyle={{
          height: habits.length * 80,
        }}
      >
        {habits.map((item) => (
          <HabitItem name={item.name} />
        ))}
      </ScrollView>
    </View>
  );
};

export default DraggableList;

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: "white",
    height: "100%",
  },
});
