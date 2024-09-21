import { View, Text } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createProgressBaselines, getTrackingProgress } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'
import TimeFrameButton from '@/components/TimeFrameButton'
import { FlashList } from "@shopify/flash-list";
import HabitProgressBar from '@/components/HabitProgressBar'

const Progress = () => {
  const { user } = useGlobalContext();
  const [timeFrame, setTimeFrame] = useState("1w")


  const timeFrameMap: Record<'1w' | '1m' | '1y' | 'YTD' | 'All', number> = {
    '1w': 0,
    '1m': 1,
    '1y': 2,
    'YTD': 3,
    'All': 4,
  };

  const timeFrameIndex = timeFrameMap[timeFrame as keyof typeof timeFrameMap];
  const handleTimeFramePress = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
  };
  return (
    <SafeAreaView className="bg-background h-full">
      <View className="flex-row justify-between items-center mt-6 mb-10">
        <View>
          <Text className="text-xl font-bold text-secondary pl-3">
            Progress
          </Text>
        </View>
      </View>
      <View className='flex-row justify-between items-center mt-2 mb-10 px-10'>
        {['1w', '1m', '1y', 'YTD', 'All'].map((frame) => (
          <TimeFrameButton
            key={frame}
            title={frame}
            isSelected={timeFrame === frame}
            handlePress={() => handleTimeFramePress(frame)}
          />
        ))}
      </View>
      <Text>You have selected {timeFrame}</Text>
      </SafeAreaView>
  )
}

export default Progress