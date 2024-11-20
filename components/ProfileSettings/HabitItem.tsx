import { View, Text } from 'react-native'
import React from 'react'

interface HabitItemProps{
    name: string
}

const HabitItem = ({name}: HabitItemProps) => {
  return (
    <View>
      <Text>{name}</Text>
    </View>
  )
}

export default HabitItem