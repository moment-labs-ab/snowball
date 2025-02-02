import { View, Text } from 'react-native'
import React from 'react'

interface SettingPageProps{
    currentSettingValue: string
}

const SettingPage: React.FC<SettingPageProps> = ({ currentSettingValue }) => {
  return (
    <View>
      <Text>{currentSettingValue}</Text>
    </View>
  )
}

export default SettingPage