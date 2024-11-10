import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router';
import icons from '../../constants/icons';
import iconSet from '@expo/vector-icons/build/FontAwesome5';

type TabIconProps = {
    icon: Object,
    color: string,
    name: string,
    focused?: boolean 

}
 /** Styles the Icons */
 const TabIcon = ({icon, color, name, focused}: TabIconProps) => {
    return(
      <View className="items-center justify-center gap-2 mb-1">
        <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-4 h-4'
        />

    <Text className={`${focused ? 'font-psemibold': 'font-pregular'} text-xs`} style={{color: color}}>
        {name}
      </Text>
      </View>
    )
   }

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#3E4E88",
          tabBarInactiveTintColor: "#8BBDFA",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#EDF5FE",
            borderTopWidth: 0,
            borderTopColor: "#EDF5FE",
            height: 45,
            marginTop:0
          },
        }}
      >
      <Tabs.Screen name='habits'
        options={{
          title: 'Habits',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.snowflake}
              color={color}
              name="Habits"
              focused={focused}
            />
          )
        }}
      />

      <Tabs.Screen name='progress_two'
        options={{
          title: 'Progress',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.progress}
              color={color}
              name="Progress"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen name='manifest'
        options={{
          title: 'Manifest',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.mountain}
              color={color}
              name="Manifest"
              focused={focused}
            />
          )
        }}
      />

      <Tabs.Screen name='profile'
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          )
        }}
      />
    </Tabs>
    </>
  )
}

export default TabsLayout