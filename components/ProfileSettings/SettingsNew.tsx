import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useGlobalContext } from '@/context/Context';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { currentUserType } from '@/types/types';
import { getCurrentUser } from '@/lib/supabase';

const SECTION = [
    {
        header: 'Profile',
        items: [
            { id: 'name', icon: 'user', label: 'Name', type: 'select' },
            { id: 'email', icon: 'mail', label: 'Email', type: 'select' },
            { id: 'change-password', icon: 'lock', label: 'Password', type: 'select' },
            { id: 'logout', icon: 'power', label: 'Logout', type: 'toggle' }
        ]
    },
    {
        header: 'Snowball',
        items: [
            { id: 'habits', icon: 'frown', label: 'Habits', type: 'link' },
            { id: 'Goals', icon: 'frown', label: 'Goals', type: 'link' },
        ]
    },
    {
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
    }
];

const SettingsNew = () => {
    const { isLoggedIn, setUser, user } = useGlobalContext()
    const [userData, setUserData] = useState<currentUserType | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)

    const getUserData = async () => {
        try {
            const userDataPull = await getCurrentUser()
            if (userDataPull) {
                setUserData(userDataPull)
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
        getUserData().finally(() => {
            setIsLoading(false),
            setSelect({ name: userData?.username || '' })
        })
    }, []);
    
    type ToggleState = {
        logout: boolean;
    };
    const [toggle, setToggle] = useState<ToggleState>({
        logout: false
    });

    type SelectState = {
        name: string
    };
    const [select, setSelect] = useState<SelectState>({
        name: ''
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
                {userData ? (<SafeAreaView className="bg-background h-full">
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
                                                <FeatherIcon name={icon} color="#616161" size={22} style={{marginRight: 12}}/>

                                                <Text style={styles.rowLabel}>{label}</Text>
                                                <View style={styles.rowSpacer} />

                                                {type === 'select' && (
                                                    <Text style={styles.rowValue}>{select[id as keyof typeof select]}</Text>
                                                )}

                                                {type === 'toggle' && (
                                                    <Switch
                                                        value={toggle[id as keyof typeof toggle]} 
                                                        onValueChange={value => setToggle(prevForm => ({ ...prevForm, [id]: value }))}
                                                    />
                                                )}

                                                {['select', 'link', 'page'].includes(type) && (
                                                    <FeatherIcon name="chevron-right" color="#ababab" size={22} style={{marginLeft: 'auto'}}/>
                                                )}
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
                ) : (
                    <Text style={styles.errorText}>Unable to load user data</Text>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default SettingsNew;

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
        backgroundColor: '#fff'
    },
    row: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingRight: 24
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