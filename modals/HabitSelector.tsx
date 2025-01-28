import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';


interface HabitSelectorProps {
  setHabit: React.Dispatch<React.SetStateAction<{
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
  }>>;
}

const HabitSelector: React.FC<HabitSelectorProps> = ({ setHabit }) => {
  const habits = [
    'Read', 'Meditate', 'Journal', 'Code', 'Exercise', 
    'Stretch', 'Take Vitamins', 'Go on a Walk', 'Practice Yoga', 'Meal Prep', 
    'Gratitude', 'Floss', 'Skincare', 'Call Parents', 'Drink Water', 'Learn',
    'Clean', 'Socialize'
  ];

  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  const handleHabitSelect = (habit: string) => {
    const newHabit = habit === selectedHabit ? null : habit;
    setSelectedHabit(newHabit);
    
    setHabit(prevState => ({
      ...prevState,
      name: newHabit || "",
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        indicatorStyle={'black'}
        contentContainerStyle={styles.scrollContainer}
      >
        {habits.map((habit) => (
          <TouchableOpacity 
            key={habit}
            style={[
              styles.habitContainer,
              selectedHabit === habit && styles.selectedHabit
            ]}
            onPress={() => handleHabitSelect(habit)}
          >
            <Text style={styles.habitText}>{habit}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  scrollContainer: {
    gap: 3,
    color:'black'
  },
  habitContainer: {
    backgroundColor: '#E6F0FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    padding:10
  },
  selectedHabit: {
    backgroundColor: '#8BBDFA',
  },
  habitText: {
    color: 'black',
    fontSize:12
  },
});

export default HabitSelector;