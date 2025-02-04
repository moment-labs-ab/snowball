import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useGlobalContext } from '@/context/Context';
import { User } from '@/types/types';
import { getCurrentUser } from '@/lib/supabase';
import { ProfileSelectState, ProfileToggleState } from '@/components/Profile/Types';
import Setting from '@/components/Profile/Setting';
import SettingsGoals from './SettingsGoals';
import SettingsHabits from './SettingsHabits';
import icons from '@/constants/icons';

const SECTION = [
    {
        header: 'Profile',
        items: [
            { id: 'name', iconType: 'feather', icon: 'user', label: 'Name', type: 'select', content: <View/>},
            { id: 'email', iconType: 'feather', icon: 'mail', label: 'Email', type: 'select' , content: <View/>},
            { id: 'change-password', iconType: 'feather', icon: 'lock', label: 'Password', type: 'select', content: <View/> },
            { id: 'logout', iconType: 'feather', icon: 'power', label: 'Logout', type: 'toggle', content: <View/> },
            { id: 'delete-account', iconType: 'feather', icon: 'trash', label: 'Delete Account', type: 'danger', content: <View/> },
        ]
    },
    {
        header: 'Snowball',
        items: [
            { id: 'habits', iconType: 'local', icon: icons.snowflake, label: 'Habits', type: 'page', content:<SettingsHabits/> },
            { id: 'goals', iconType: 'local', icon: icons.mountain, label: 'Goals', type: 'page', content:<SettingsGoals/>  },
        ]
    },
    /*{
        header: 'Stats',
        items: [
            { id: 'stats', icon: 'frown', label: 'Stats', type: 'select' },
        ]
    },
    {
        header: 'Help',
        items: [
            { id: 'report-bug', icon: 'frown', label: 'Report Bug', type: 'select' },
            { id: 'feedback', icon: 'frown', label: 'Feedback', type: 'select' },
            { id: 'terms', icon: 'frown', label: 'Terms & Conditions', type: 'select' },
            { id: 'privacy', icon: 'frown', label: 'Privacy Policy', type: 'select' },
        ]
    }*/
];

const SettingsHome = () => {
    const { isLoggedIn, setIsLoggedIn, setUser, user } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)

    const getUserData = async () => {
        try {
            const userDataPull = await getCurrentUser()
            if (userDataPull) {
                setUser(userDataPull)
            } else {
                Alert.alert('Error', 'Unable to fetch user data')
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch user data')
            console.error('Error fetching user data:', error)
        }
    }

    useEffect(() => {
        setIsLoading(true)
        getUserData().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        setSelect({
            name: user.username || '',
            email: user.email || ''
        });
    }, [user]);

    const [toggle, setToggle] = useState<ProfileToggleState>({
        logout: false
    });

    const [select, setSelect] = useState<ProfileSelectState>({
        name: '',
        email: '',
    });

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3e4e88" />
            </View>
        )
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView>
                {user ? (<SafeAreaView className="bg-background h-full">
                    {SECTION.map(({ header, items }) => (
                        <View style={styles.section} key={header}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionHeaderText}>{header}</Text>
                            </View>

                            <View>
                                {items.map(({ label, id, type, iconType, icon, content}, index) => (
                                    <Setting
                                        label={label}
                                        accountSetting={type}
                                        index={index}
                                        iconType={iconType}
                                        icon={icon}
                                        id={id}
                                        selectValue={select[id as keyof typeof select]}
                                        toggleValue={toggle[id as keyof typeof toggle]}
                                        toggleSetState={setToggle}
                                        content={content}
                                    />
                                ))}

                            </View>
                        </View>
                    ))}
                    <View>

                    </View>
                </SafeAreaView>
                ) : (
                    <Text style={styles.errorText}>Unable to load user data</Text>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default SettingsHome;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        backgroundColor: '#edf5fe',
    },
    section: {
        paddingTop: 12
    },
    sectionHeader: {
        paddingHorizontal: 24,
        paddingVertical: 8
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#a7a7a7',
        textTransform: 'uppercase',
        letterSpacing: 1.2
    },
    rowWrapper: {
        paddingLeft: 24,
        borderTopWidth: 1,
        borderColor: '#e3e3e3',
        backgroundColor: '#fff',
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 10,
    },
    row: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingRight: 24,
    },
    rowLabel: {
        fontSize: 17,
        fontWeight: '500',
        color: '#212121'
    },
    rowSpacer: {
        flex: 1
    },
    rowValue: {
        fontSize: 17,
        fontWeight: '500',
        color: '#616161',
        marginRight: 4,
    },
    errorText: {
        color: '#ff4444',
        textAlign: 'center',
        marginTop: 16,
    },
});