import { View, Text } from 'react-native'
import React from 'react'

interface SettingUpdateProps{
    currentSettingValue: string
}

const SettingUpdate: React.FC<SettingUpdateProps> = ({ currentSettingValue }) => {
  return (
    <View>
      <Text>{currentSettingValue}</Text>
    </View>
  )
}

export default SettingUpdate