import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router';
import icons from '@/constants/icons';

type TabIconProps = {
    icon: Object,
    color: string,
    name: string,
    focused?: boolean

}
/** Styles the Icons */
const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
    return (
        <View className="items-center justify-center gap-2 mb-1" style={{ minWidth: 60 }}>
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
                        borderTopColor: "#8BBDFA",
                        height: 60,
                        marginTop: 0
                    },
                }}
            >
                <Tabs.Screen name='habits'
                    options={{
                        title: 'Habits',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.snowflake}
                                color={color}
                                name={"Habits"}
                                focused={focused}
                            />
                        )
                    }}
                />

                <Tabs.Screen name='goals'
                    options={{
                        title: 'Goals',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.mountain}
                                color={color}
                                name={"Goals"}
                                focused={focused}
                            />
                        )
                    }}
                />

                <Tabs.Screen name='profile'
                    options={{
                        title: 'Profile',
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.profile}
                                color={color}
                                name={"Profile"}
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