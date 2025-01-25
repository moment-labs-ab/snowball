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
    <View className="items-center justify-center gap-2 mb-1" style={{ minWidth: 60 }}> {/* Adjust width as needed */}
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-5 h-5'
      />
      <Text
        numberOfLines={1}
        className={`${focused ? 'font-psemibold' : 'font-pregular'}`}
        style={{ color: color, fontSize: 10, textAlign: 'center', width: '100%' }}
      >
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
            height: 55,
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
              name={"Habits"}
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
              name={"Progress"}
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen name='goals'
        options={{
          title: 'Goals',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.mountain}
              color={color}
              name={"Goals"}
              focused={focused}
            />
          )
        }}
      />

      <Tabs.Screen name='profile'
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color, focused}) => (
            <TabIcon 
              icon ={icons.settings}
              color={color}
              name={"Settings"}
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