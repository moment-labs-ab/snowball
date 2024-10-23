import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from '@react-navigation/native';
import { ProgressData } from '@/types/types';
import { listenToTrackingHistory, getFullProgressData } from '@/lib/supabase_progress';
import LoadingScreen from './LoadingScreen';

type HabitProgressBarProps = {
  timeFrame: string;
  userId: string;
  date: Date;
};

const HabitProgressBar = ({ timeFrame, userId, date }: HabitProgressBarProps) => {
  const [updatedProgress, setUpdatedProgress] = useState<ProgressData>();
  const [habitsArray, setHabitsArray] = useState<[string, any][]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const timeFrameMap: Record<'1w' | '1m' | 'YTD' | '1y' | 'All', number> = {
    '1w': 0,
    '1m': 1,
    'YTD': 2,
    '1y': 3,
    'All': 4,
  };

  const timeFrameIndex = timeFrameMap[timeFrame as keyof typeof timeFrameMap];
  const screenHeight = Dimensions.get('window').height;

  // Function to fetch progress data
  const getProgressData = async () => {
    try {
      const fullProgressData = await getFullProgressData(userId, date);
      if (fullProgressData) {
        setUpdatedProgress(fullProgressData);
        const progressArray = Object.entries(fullProgressData);
        setHabitsArray(progressArray);
      }
      console.log(Object.keys(fullProgressData)[0])
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  // useEffect to load data when the component first mounts
  useEffect(() => {
    getProgressData();
  }, [userId, date]);

  // useFocusEffect to refresh data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, refreshing progress data");
      setRefreshKey((prevKey) => prevKey + 1);
      getProgressData();

      const unsubscribe = listenToTrackingHistory((payload) => {
        console.log('Change received in Progress!', payload);
        getProgressData();
        switch (payload.eventType) {
          case 'INSERT':
            handleRefresh(payload.habitId, payload.new);
          case 'UPDATE':
            handleRefresh(payload.habitId, payload.new);
          case 'DELETE':
            handleRefresh(payload.habitId, payload.new);
            break;
        }
      });

      return () => {
        unsubscribe();
      };
    }, [timeFrame, userId, date])
  );

  const handleRefresh = (habitId: string, newProgress: number[]) => {
    setRefreshKey((prevKey) => prevKey + 1); // Trigger re-render
    setUpdatedProgress((prevProgress) => {
      if (!prevProgress) return prevProgress;
      return {
        ...prevProgress,
        [habitId]: {
          ...prevProgress[habitId],
          progress: newProgress,
        },
      };
    });

  

    if (updatedProgress) {
      const progressArray = Object.entries(updatedProgress);
      setHabitsArray(progressArray);
    }
  };

  if (!habitsArray.length) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.habitContainer, { height: screenHeight * 0.58 }]}>
      <FlashList
        data={habitsArray}
        keyExtractor={([id]) => id}
        renderItem={({ item }) => {
          const [id, habit] = item;
          const currentHabit = habit;

          const progressValue = currentHabit['progress'][timeFrameIndex];
          const baselineValue = currentHabit['baselines'][timeFrameIndex];
          const progressRatio = Math.min(progressValue / baselineValue, 1);
          const progressPercent = Math.round(progressRatio * 100);
          const habitName = currentHabit['name'];
          const frequency = currentHabit['frequency'];
          const frequency_rate = currentHabit['frequency_rate'];
          

          return (
            <View style={styles.habitItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.habitName}>{habitName}</Text>
                <Text style={{ fontSize: 13, fontWeight: '400' }}> {progressPercent}% </Text>
              </View>
              <Text style={styles.habitFrequency}>
                {frequency}x {frequency_rate}
              </Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBar, { width: `${progressRatio * 100}%` }]} />
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
    backgroundColor: '#9ec8fb',
    borderRadius: 20,
    padding: 16,
    margin: 2,
  },
  habitItem: {
    marginBottom: 35,
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitFrequency: {
    color: 'grey',
    fontWeight: '300',
    fontSize: 12,
    zIndex: 1,
    marginBottom: 8,
  },
  progressBarBackground: {
    backgroundColor: '#e0e0e0',
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: '#3e4e88',
    height: '100%',
  },
});

export default HabitProgressBar;
