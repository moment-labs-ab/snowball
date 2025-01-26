import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

interface Milestone {
  checked: boolean;
  milestone: string;
}

interface MilestonesListProps {
  data: Milestone[];
  onCheckMilestone: (index: number) => void;
  checkmarkColor: string;
}

const MilestonesList: React.FC<MilestonesListProps> = ({ data, onCheckMilestone, checkmarkColor }) => {
  // Ensure always 5 milestones, filling extras with empty milestones
  const filledData = [
    ...data,
    ...Array(5 - data.length).fill({ checked: false, milestone: '' })
  ].slice(0, 5);

  const renderItem = ({ item, index }: { item: Milestone; index: number }) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onCheckMilestone(index)}
          disabled={!item.milestone}
        >
          <Ionicons
            name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.checked ? checkmarkColor : '#ccc'}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text 
            style={[
              styles.milestoneText, 
              item.checked && styles.checkedText,
              !item.milestone && styles.emptyMilestone
            ]} 
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.milestone}
          </Text>
          {item.milestone && <View style={styles.underline} />}
        </View>
      </View>
    );
  };

  return (
    <FlashList
      data={filledData}
      renderItem={renderItem}
      estimatedItemSize={100}
      keyExtractor={(_, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    position: 'relative',
  },
  milestoneText: {
    fontSize: 16,
    color: 'black',
    flex: 1,
    flexShrink: 1,
    textAlign:'center'
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  emptyMilestone: {
    color: '#ccc',
  },
  underline: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default MilestonesList;