import React from 'react';
import { View, Text, StyleSheet, Dimensions} from 'react-native';
import { FlashList } from "@shopify/flash-list";
type ProgressData = Record<string, number[]>;

type HabitProgressBarProps = {
  progress: ProgressData;
  baselines: ProgressData;
  timeFrame: string
};

const HabitProgressBar = ({progress, baselines, timeFrame}: HabitProgressBarProps) =>{
  const timeFrameMap: Record<'1w' | '1m' | 'YTD' | '1y' | 'All', number> = {
    '1w': 0,
    '1m': 1,
    'YTD': 2,
    '1y': 3,
    'All': 4,
  };

  const timeFrameIndex = timeFrameMap[timeFrame as keyof typeof timeFrameMap];
  const screenHeight = Dimensions.get('window').height;
  return (
    <View style={[styles.habitContainer, { height: screenHeight * 0.58 }]}>
      {/* FlashList rendering progress bars and habit names */}
      <FlashList
        data={Object.keys(baselines)}
        keyExtractor={(habitName) => habitName}
        renderItem={({ item: habitName }) => {
          const habitProgress = progress[habitName];
          const habitBaseline = baselines[habitName];

          if (!habitProgress || !habitBaseline) {
            return null;
          }

          // Calculate progress ratio
          const progressValue = habitProgress[timeFrameIndex];
          const baselineValue = habitBaseline[timeFrameIndex];
          const progressRatio = Math.min(progressValue / baselineValue, 1); // Clamp ratio to 1

          return (
            <View style={styles.habitItem}>
              {/* Habit Name */}
              <Text style={styles.habitName}>{habitName}</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progressRatio * 100}%` }, // Set width based on progress ratio
                  ]}
                />
              </View>

              {/* Progress and Baseline values */}
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>Progress: {progressValue}</Text>
                <Text style={styles.progressText}>Baseline: {baselineValue}</Text>
              </View>
            </View>
          );
        }}
        estimatedItemSize={80}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  habitContainer: {
    backgroundColor: '#9ec8fb', // Background color for the entire box
    borderRadius: 20, // Rounded corners for the whole container
    padding: 16, // Padding inside the container
    margin: 2, // Space around the container
  },
  habitItem: {
    marginBottom: 20, // Space between each habit item
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10, // Space between the name and progress bar
  },
  progressBarBackground: {
    backgroundColor: '#e0e0e0', // Background of the progress bar
    height: 10, // Height of the progress bar
    borderRadius: 10, // Rounded corners for the progress bar
    overflow: 'hidden', // Ensure the inner progress is contained within rounded corners
  },
  progressBar: {
    backgroundColor: '#3e4e88', // Progress color
    height: '100%', // Fill the full height
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute progress and baseline text
    marginTop: 10, // Space between progress bar and text
  },
  progressText: {
    fontSize: 14,
    color: '#333', // Text color
  },
});

export default HabitProgressBar;