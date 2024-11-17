import { View, Text, Button, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {listenToTrackingHistory, getFullProgressData, getGridTrackingHistory } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'

import { ProgressData } from '@/types/types'

import TrackingDisplay from '@/components/TrackingDisplay'
import { endAsyncEvent } from 'react-native/Libraries/Performance/Systrace'

const Progress = () => {
  const [progress, setProgress] = useState<ProgressData>();
  const { user } = useGlobalContext();
  const [timeFrame, setTimeFrame] = useState("1m")
  const [refreshKey, setRefreshKey] = useState(0);
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startDate, setStartDate] = useState<Date>(new Date())

  const now = new Date()
  const today = new Date(now.toDateString())
  const oneMonthAgo = getLastMonth(endDate)
  function getLastMonth(date: Date): Date {
    const lastMonthDate = new Date(date);
    lastMonthDate.setDate(lastMonthDate.getDate() - 34);
    return lastMonthDate;
  }


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

  useEffect(()=>{
    setStartDate(oneMonthAgo)
    setEndDate(today)
    //console.log(startDate)
    //console.log(endDate)

  }, [])




  return (
    <SafeAreaView className="bg-background h-full">
    <View className='flex-1 align-center pl-2 pr-2'>
      <View style={{width:375, height:90, backgroundColor:'#edf5fe', borderRadius:8,marginBottom:10, backfaceVisibility:'visible'}}>
    <View className="flex-row justify-between items-center mt-6">
        <Text className="text-xl font-bold text-secondary pl-2">
          Progress
        </Text>
    </View>
    <View className="flex-row justify-between items-center mt-1 mb-1">
    <Text className="text-l font-bold text-primary pl-2">How's the Snowball Looking?</Text>
    </View>
    <View
      style={{
        height: 2, // Thickness of the line
        width: '98%', // Length of the line (adjust this to your desired length)
        backgroundColor: '#3e4e88', // Color of the line
        alignSelf: 'center', // Centers the line within the parent container
        marginTop: 10, // Space between the DatePicker and the line
      }}
    /> 
    </View>
    <TrackingDisplay />     
  </View>
  </SafeAreaView>
  )
        }

export default Progress;
