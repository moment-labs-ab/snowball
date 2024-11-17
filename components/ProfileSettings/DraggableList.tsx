import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import Entypo from '@expo/vector-icons/Entypo';
import { Habit } from '@/types/types';

type HabitListProps = {
  habits: Habit[];
};

const DraggableList: React.FC<HabitListProps> = ({ habits }) => {
  const [currentHabits, setCurrentHabits] = useState<Habit[]>(habits);

  const renderItem = ({ item, isActive }: DragListRenderItemInfo<Habit>) => (
    <View
      style={[
        styles.movingContainer,
        isActive ? { backgroundColor: '#cfe3ff' } : null,
      ]}
    >
      <Text style={styles.habitName}>{item.name}</Text>
      <Entypo name="menu" size={24} color="gray" />
    </View>
  );

  const handleDragEnd = () => {
    // Reorder logic must be handled by DragList internally.
    // currentHabits is updated automatically when reordering occurs.
    console.log('Drag ended, current habits:', currentHabits);
  };

  return (
      <DragList
        data={currentHabits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
      />
  );
};

export default DraggableList;

const styles = StyleSheet.create({
  movingContainer: {
    borderWidth: 1,
    minWidth: 330,
    borderColor: 'black',
    borderRadius: 4,
    backgroundColor: '#edf5fe',
    minHeight: 62,
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 16,
    overflow: 'hidden',
    paddingRight: 30,
    paddingLeft: 5,
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
