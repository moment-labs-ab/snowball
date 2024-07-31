import { View, Text, TextInput, FlatList } from 'react-native'
import React from 'react'
import { Habit } from '@/types/types'

interface DailyHabitDisplayProps{
    habits: Habit[]
}

const DailyHabitDisplay = ({habits}: DailyHabitDisplayProps) => {


  return (
    <View>
    <FlatList 
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <View className='flex-row'>
                <Text>{item.name} </Text>
                <Text>{item.frequency} </Text>
                <Text>{item.frequency_rate} </Text>
                <Text>{item.created_at} </Text>
                <Text>{item.reminder}</Text>
            </View>
            )}
            />

    </View>
  )
}

export default DailyHabitDisplay
