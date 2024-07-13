import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useContext } from 'react'
import { useGlobalContext } from '@/context/Context'

const Habits = () => {
  const { user } = useGlobalContext();
  
  return (
    <SafeAreaView className="bg-background h-full">
    <View>
      <Text>{user.email}</Text>
    </View>
    </SafeAreaView>
  )
}

export default Habits