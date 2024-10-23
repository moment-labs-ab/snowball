import { View, Text, Button, ScrollView, Dimensions } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {listenToTrackingHistory, getFullProgressData } from '@/lib/supabase_progress'
import { useGlobalContext } from '@/context/Context'
import TimeFrameButton from '@/components/TimeFrameButton'
import { ProgressData } from '@/types/types'

import HabitProgressBar from '@/components/HabitProgressBar'
import LoadingScreen from '@/components/LoadingScreen'

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

  const now = new Date();
  const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  
  const getProgressData = async () => {
    try {
      const fullProgressData = await getFullProgressData(user?.userId, localDate)
      // Sort progressData by createdAt before returning it

      //setProgress(fullProgressData)
      return fullProgressData

    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  }



useEffect(() =>{

  // Call the async function
    const unsubscribe = listenToTrackingHistory((payload) => {
    console.log('Change received in Progress!', payload);
    switch (payload.eventType) {
      case 'INSERT':
        setRefreshKey(prevKey => prevKey + 1)
        break;
      case 'UPDATE':
        setRefreshKey(prevKey => prevKey + 1)
        break;
      case 'DELETE':
        setRefreshKey(prevKey => prevKey + 1)
        break;
    }
    });

    // Cleanup subscription on unmount
    return () => {
    unsubscribe();
    };
}, [])
const screenWidth = Dimensions.get('window').width;


  return (

    <SafeAreaView className="bg-background h-full">
      <View className='flex-1 align-center pl-2 pr-2'>
        <View style={{width:375, height:175, backgroundColor:'#9ec8fb', borderRadius:20,marginBottom:20}}>
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

      <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={screenWidth} // Snap to each screen width
          decelerationRate="fast" // Makes the snapping faster
          showsHorizontalScrollIndicator={true}
        >
          {/* Habit Progress Bar */}
          <View style={{ width: screenWidth-20 }}>
            <HabitProgressBar
              timeFrame={timeFrame}
              userId={user.userId}
              date={localDate}
            />
          </View>

          {/* Rectangle view displaying progress object */}
          <View style={{ width: screenWidth, backgroundColor: '#e0f7fa', justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}>
            <Text className="text-xl font-bold">Progress Details</Text>
            <Text>{JSON.stringify(progress, null, 2)}</Text>
          </View>
        </ScrollView>
        <View key={refreshKey}>
        </View>
      
      
      
   
    </View>
    </SafeAreaView>
  )
        }

export default Progress;

          {/*
            <HabitProgressBartest
            habitId={habitId}
            progress={habitProgress[timeFrameIndex]}
            baseline={habitBaseline[timeFrameIndex]}/>
            */}