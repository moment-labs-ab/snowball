import { View, Text, Button, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {listenToTrackingHistory, getFullProgressData, getGridTrackingHistory } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'

import { ProgressData } from '@/types/types'

import TrackingDisplay from '@/components/TrackingDisplay'

const Progress = () => {
  const [progress, setProgress] = useState<ProgressData>();
  const { user } = useGlobalContext();
  const [timeFrame, setTimeFrame] = useState("1m")
  const [refreshKey, setRefreshKey] = useState(0);

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




  return (
    <SafeAreaView className="bg-background h-full">
    <View className='flex-1 align-center pl-2 pr-2'>
      <View style={{width:375, height:100, backgroundColor:'#3e4e88', borderRadius:8,marginBottom:20}}>
    <View className="flex-row justify-between items-center mt-6">
        <Text className="text-xl font-bold text-primary pl-3">
          Progress
        </Text>
    </View>
    <View className="flex-row justify-between items-center mt-1 mb-6">
    <Text className="text-s font-bold text-white pl-3">How's the Snowball Looking?</Text>
    </View>      
    </View>
    <TrackingDisplay />     
  </View>
  </SafeAreaView>
  )
        }

export default Progress;
