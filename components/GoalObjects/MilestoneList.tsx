import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // For checkboxes
import { FlashList } from '@shopify/flash-list';
import { Milestones } from '@/types/types';


interface MilestoneListProps {
  data: Milestones[];
}

const MilestoneList: React.FC<MilestoneListProps> = ({ data }) => {
  const [milestones, setMilestones] = useState(data);

  const toggleCheck = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index].checked = !updatedMilestones[index].checked;
    setMilestones(updatedMilestones);
  };

  const renderItem = ({ item, index }: { item: Milestones; index: number }) => (
    <View style={styles.item}>
      <TouchableOpacity onPress={() => toggleCheck(index)} style={styles.checkbox}>
        <MaterialCommunityIcons
          name={item.checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={item.checked ? 'green' : 'gray'}
        />
      </TouchableOpacity>
      <Text style={styles.text}>{item.milestone}</Text>
    </View>
  );

  return (
    <FlashList
      data={milestones}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default MilestoneList;
