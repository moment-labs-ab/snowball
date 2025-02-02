import { View, Text } from 'react-native'
import React from 'react'

interface SettingPageProps{
    currentSettingValue: string
    label: string,
    action?: () => void
    content?: React.ReactNode;
}

const SettingPage: React.FC<SettingPageProps> = ({ currentSettingValue, label, action, content }) => {
  return (
    <View>
      <Text>{label}</Text>

      {content}
    </View>
  )
}

export default SettingPage