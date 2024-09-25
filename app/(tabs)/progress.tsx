import { View, Text } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createProgressBaselines, getTrackingProgress } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'
import TimeFrameButton from '@/components/TimeFrameButton'

import HabitProgressBar from '@/components/HabitProgressBar'

type ProgressData = Record<string, number[]>;

const Progress = () => {
  const [baselines, setBaselines] = useState<ProgressData>({});
  const [progress, setProgress] = useState<ProgressData>({});
  const { user } = useGlobalContext();
  const [timeFrame, setTimeFrame] = useState("1w")

  const timeFrameMap: Record<'1w' | '1m' | 'YTD' | '1y' | 'All', number> = {
    '1w': 0,
    '1m': 1,
    'YTD': 2,
    '1y': 3,
    'All': 4,
  };

  const timeFrameIndex = timeFrameMap[timeFrame as keyof typeof timeFrameMap];
  const handleTimeFramePress = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
  };

  const now = new Date();
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

  useEffect(() => {
    const getProgressData = async () => {
      try {
        const fetchedBaselines = await createProgressBaselines(user?.userId, localDate);
        const fetchedProgress = await getTrackingProgress(user?.userId, localDate);

        setBaselines(fetchedBaselines || {});
        setProgress(fetchedProgress || {});
        console.log(fetchedBaselines);
        console.log(fetchedProgress);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };
    getProgressData();
  }, []);

  if (!progress || !baselines) {
    return <Text> LOADING</Text>;
  }
  else{

  return (

    <SafeAreaView className="bg-background h-full">
      <View className='flex-1 align-center pl-2 pr-2'>
        <View style={{width:375, height:175, backgroundColor:'#b5d5fc', borderRadius:20,marginBottom:20}}>
      <View className="flex-row justify-between items-center mt-6">
          <Text className="text-xl font-bold text-secondary pl-3">
            Progress
          </Text>
      </View>
      <View className="flex-row justify-between items-center mt-1 mb-6">
      <Text className="text-s font-bold text-white pl-3">How's the Snowball Looking?</Text>
      </View>
      <View className='flex-row justify-between items-center mt-2 mb-10 px-10'>
        {['1w', '1m', 'YTD', '1y', 'All'].map((frame) => (
          <TimeFrameButton
            key={frame}
            title={frame}
            isSelected={timeFrame === frame}
            handlePress={() => handleTimeFramePress(frame)}
          />
        ))}
      </View>
      </View>
        <HabitProgressBar
        progress={progress}
        baselines={baselines}
        timeFrame={timeFrame}/>
      </View>

      

      </SafeAreaView>
  )
}}

export default Progress

          {/*
            <HabitProgressBartest
            habitId={habitId}
            progress={habitProgress[timeFrameIndex]}
            baseline={habitBaseline[timeFrameIndex]}/>
            */}