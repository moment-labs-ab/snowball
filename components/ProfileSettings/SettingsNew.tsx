import { View, Text, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomButton from '@/components/CustomButtom';
import { signOut } from '@/lib/supabase';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/Context';
import { getUserLoginCount } from '@/lib/supabase_profile';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProfileSettings from '@/components/ProfileSettings';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LifetimeHabitStats } from '@/types/types';
import { getLifetimeHabitStats } from '@/lib/supabase_profile';
import ProfileButton from '@/components/ProfileButton';
import EditProfile from '@/components/ProfileSettings/EditProfile';
import ProfileStats from '@/components/ProfileSettings/ProfileStats';
import ProfileHabits from '@/components/ProfileSettings/ProfileHabits';
import Feedback from '@/components/ProfileSettings/Feedback';

const SECTION = [
    {
        header: 'Profile',
        items: [
            { id: 'name', icon: 'person', label: 'Name', type: 'text' },
            { id: 'email', icon: 'mail', label: 'Email', type: 'text' },
            { id: 'change-password', icon: 'password', label: 'Password', type: 'text' },
            { id: 'logout', icon: 'power', label: 'Logout', type: 'toggle' }
        ]
    },
    {
        header: 'Snowball',
        items: [
            { id: 'habits', icon: 'snowflake', label: 'Habits', type: 'page' },
            { id: 'Goals', icon: 'mountains', label: 'Goals', type: 'page' },
        ]
    },
    {
        header: 'Stats',
        items: [
            { id: 'stats', icon: 'stats', label: 'Stats', type: 'page' },
        ]
    },
    {
        header: 'Help',
        items: [
            { id: 'report-bug', icon: 'bug', label: 'Report Bug', type: 'page' },
            { id: 'feedback', icon: 'feedback', label: 'Feedback', type: 'page' },
            { id: 'terms', icon: 'terms', label: 'Terms & Conditions', type: 'page' },
            { id: 'privacy', icon: 'privacy-tip', label: 'Privacy Policy', type: 'page' },
        ]
    }
];

const SettingsNew = () => {
    const { setIsLoggedIn, setUser, isLoggedIn, user } = useGlobalContext();
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (user) {

        }
    }, []);

    // Functions for handling modals and tooltips
    const handleOpenModal = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="bg-background h-full">
                {SECTION.map(({header, items}) => (
                    <View style={styles.section} key={header}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{header}</Text>
                        </View>

                        <View>
                            {items.map(({label, id, type, icon}, index) => (
                                <View style={[styles.rowWrapper, index === 0 && {borderTopWidth: 0}]} key={id}>
                                    <TouchableOpacity onPress={() => {console.log(`${label} Pressed`)}}>
                                        <View style={styles.row}>
                                            <Text>{label}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        
                        </View>
                    </View>
                ))}
                <View>

                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

export default SettingsNew;

const styles = StyleSheet.create({
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
        backgroundColor: '#fff'
    },
    row: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 24
    }
});