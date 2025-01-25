import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

interface GoalSelectorProps {
  setName: React.Dispatch<React.SetStateAction<string>>;
  selectedColor?: string;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({ 
  setName, 
  selectedColor = '#4CAF50' 
}) => {
    const goals = [
        "Cut Screen Time",
        "Become More Flexible",
        "Learn a New Language",
        "Read More Books",
        "Build a Daily Meditation Habit",
        "Exercise Regularly",
        "Improve Sleep Quality",
        "Develop a Consistent Morning Routine",
        "Save More Money",
        "Learn a New Skill (e.g., Cooking, Photography)",
        "Spend More Time Outdoors",
        "Strengthen Personal Relationships",
        "Volunteer for a Cause",
        "Start Journaling",
        "Practice Gratitude Daily",
        "Drink More Water",
        "Eat Healthier Meals",
        "Create a Monthly Budget",
        "Explore a New Hobby",
        "Take Steps Towards Career Growth",
        "Travel to a New Place",
        "Organize Living Space",
        "Practice Self-Care Weekly",
        "Reduce Social Media Usage",
        "Work on Public Speaking Skills",
        "Write a Personal Blog or Journal",
        "Learn Basic First Aid",
        "Cultivate a Growth Mindset",
        "Focus on Mental Health Awareness",
        "Learn to Play a Musical Instrument",
        "Attend More Networking Events",
        "Develop Better Time Management Skills",
        "Contribute to Environmental Sustainability",
        "Complete a Personal Creative Project",
        "Run or Walk a Certain Distance",
        "Take a Digital Detox Weekend",
        "Cook a New Recipe Every Week",
        "Improve Posture",
        "Learn Basic DIY or Repair Skills"
      ];

  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleGoalSelect = (goal: string) => {
    const newGoal = goal === selectedGoal ? null : goal;
    setSelectedGoal(newGoal);
    setName(newGoal || "");
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {goals.map((goal) => (
          <TouchableOpacity 
            key={goal}
            style={[
              styles.goalContainer,
              selectedGoal === goal && { 
                backgroundColor: selectedColor 
              },
              selectedGoal !== goal && styles.unselectedGoal
            ]}
            onPress={() => handleGoalSelect(goal)}
          >
            <Text style={styles.goalText}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 5,
  },
  scrollContainer: {
    gap: 3,
    color:'black'
  },
  goalContainer: {
    backgroundColor: '#E6F0FF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  unselectedGoal: {
    borderWidth: 1,
    borderColor: '#E6F0FF',
  },
  selectedGoal: {
    backgroundColor: '#4CAF50',
  },
  goalText: {
    color: 'black',
    fontSize:12
  },
});


export default GoalSelector;