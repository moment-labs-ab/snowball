import { View, Text, StyleSheet } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';

type PremiumVsBasicViewProps = {
  freeFeatures: string[]
  premiumFeatures: string[]
}

export const PremiumVsBasicView = ({
  freeFeatures,
  premiumFeatures,
}: PremiumVsBasicViewProps) => {
  return (
    <View className="flex-row justify-between px-4 gap-10">
        {/* Premium Tier */}
      <View className="flex-1 ml-2">
        <Text className="text-lg font-bold mb-4 text-center" style={{color:"#5ee38f"}}>Premium</Text>
        {premiumFeatures.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-3 gap-2">
            <AntDesign name="checkcircleo" size={20} color="#39dd75" />

            <Text className="text-base text-gray-700"> {feature}</Text>
          </View>
        ))}
      </View>
      {/* Free Tier */}
      <View className="flex-1 mr-2">
        <Text className="text-lg font-bold mb-4 text-center">Free</Text>
        {freeFeatures.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-3 gap-2">
            <AntDesign name="checkcircleo" size={20} color="#808080" />
            <Text className="text-base text-gray-700"> {feature}</Text>
          </View>
        ))}
      </View>

      
    </View>
  )
}
