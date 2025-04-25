import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';


interface MetricSelectorProps {
  setHabit: React.Dispatch<React.SetStateAction<{
    name: string;
    frequency: number;
    frequency_rate: string;
    reminder: boolean;
    emoji: string;
    metric: string;
  }>>;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({ setHabit }) => {
  const metrics = [
    "Miles",
    "Bottles",
    "Steps",
    "Reps",
    "Minutes",
    "Hours",
    "Pages",
    "Words",
    "Glasses",
    "Kilometers",
    "Breaths",
    "Pushups",
    "Sessions",
    "Checkins",
    "Entries",
    "Tasks",
    "Logs"
  ];

  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const handleMetricSelect = (habit: string) => {
    const newMetric = habit === selectedMetric ? null : habit;
    setSelectedMetric(newMetric);
    
    setHabit(prevState => ({
      ...prevState,
      metric: newMetric || "",
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
        {metrics.map((metric) => (
          <TouchableOpacity 
            key={metric}
            style={[
              styles.habitContainer,
              selectedMetric === metric && styles.selectedHabit
            ]}
            onPress={() => handleMetricSelect(metric)}
          >
            <Text style={styles.habitText}>{metric}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  scrollContainer: {
    gap: 3,
    color:'black',
  },
  habitContainer: {
    backgroundColor: '#b8d4ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 10,
    padding:10,
    flex:1
  },
  selectedHabit: {
    backgroundColor: '#8BBDFA',
    borderWidth:2,
    borderColor:'black'
  },
  habitText: {
    color: 'black',
    fontSize:12
  },
});

export default MetricSelector;