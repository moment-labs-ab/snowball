import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserPremiumStatus } from '@/lib/supabase_payments';
import PremiumComparisonTable from './PremiumComparisonTable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CurrentPremiumPage = () => {
    const [premiumMemberSince, setPremiumMemberSince] = useState("");

    //TODO: Move this to a utility function
    function formatDateToReadable(input: string): string {
        const date = new Date(input);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };

        return date.toLocaleDateString('en-US', options);
    }

    useEffect(() => {
        const fetchPremiumMemberSince = async () => {
            const response = await getUserPremiumStatus();

            if (response) {
                const formattedDate = formatDateToReadable(response.createdAt);
                setPremiumMemberSince(formattedDate);
            }
        };

        fetchPremiumMemberSince();
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Snowball
                    <Text style={styles.premiumText}> Premium</Text><MaterialCommunityIcons name="crown" size={28} color="#8BBDFA" />
                </Text>
                <Text style={styles.subtitle}>
                    Joined: <Text style={styles.premiumDate}>{premiumMemberSince}</Text>
                </Text>
            </View>

            <PremiumComparisonTable />
        </View>
    )
}

export default CurrentPremiumPage;

const styles = StyleSheet.create({
    headerText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3e4e88',
        textAlign: 'center',
    },
    premiumText: {
        color: '#FAC88B',
    },
    container: {
        flex: 1,
        margin: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        color: '#3e4e88',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    premiumDate: {
        color: '#8BBDFA',
        fontWeight: 'bold',
    },

});