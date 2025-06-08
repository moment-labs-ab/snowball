import { View, Text, Alert, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { router } from "expo-router";

import RevenueCatUI from 'react-native-purchases-ui'
import { AntDesign } from '@expo/vector-icons';
import { useGlobalContext } from '@/context/Context';
import { restoreUserWithPremium, updateUserWithPremium } from '@/lib/supabase_payments';
import CurrentPremiumPage from './CurrentPremiumPage';

function handleDismiss() {
    router.navigate('/profile');
}

interface Props {
    toggleContent?: () => void | null;
}

const Paywall: React.FC<Props> = ({ toggleContent }) => {
    const { setUser, user } = useGlobalContext();
    const [isLoading, setIsLoading] = useState(false);

    async function handlePurchaseCompleted() {
        console.log("Purchase completed");
        const user = await updateUserWithPremium()
        setIsLoading(false);

        if (!user) {
            Alert.alert("Purchase Error", "Please try again later");
            return;
        }

        setUser((prevUser) => ({
            ...prevUser,
            premiumUser: true
        }));

        if (toggleContent) {
            toggleContent();
        }
        else {
            router.navigate('/profile');
        }

        Alert.alert("Success", "Enjoy Snowball Premium!");
    }

    function handePuchaseStarted() {
        setIsLoading(true);
        console.log("Purchase started");
    }

    function handlePurchaseError() {
        Alert.alert("Purchase Error", "Please try again later");
        setIsLoading(false);
    }

    function handlePurchaseCancelled() {
        Alert.alert("Purchase Cancelled");
        if (toggleContent) {
            toggleContent();
        }
        else {
            router.navigate('/profile');
        }
    }

    async function handleRestoreCompleted() {
        const user = await restoreUserWithPremium();
        setIsLoading(false);

        if (!user) {
            Alert.alert("Purchase Error", "Please try again later");
            return;
        }

        setUser((prevUser) => ({
            ...prevUser,
            premiumUser: true
        }));

        if (toggleContent) {
            toggleContent();
        }
        else {
            router.navigate('/profile');
        }
    }

    function handeRestoreStarted() {
        setIsLoading(true);
    }

    function handleRestoreError() {
        Alert.alert("Restore Error", "Please try again later.");
        setIsLoading(false);
    }

    return (
        <SafeAreaView style={styles.modalContainer}>
            {toggleContent && (
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={toggleContent}>
                        <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.spacer} />
                </View>
            )}


            {!user.premiumUser && <RevenueCatUI.Paywall
                onDismiss={handleDismiss}
                onPurchaseCompleted={handlePurchaseCompleted}
                onPurchaseStarted={handePuchaseStarted}
                onPurchaseError={handlePurchaseError}
                onPurchaseCancelled={handlePurchaseCancelled}
                onRestoreCompleted={handleRestoreCompleted}
                onRestoreStarted={handeRestoreStarted}
                onRestoreError={handleRestoreError}
            />}

            {user.premiumUser && <CurrentPremiumPage/>}

            {isLoading && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3e4e88" />
            </View>
        )}
        </SafeAreaView>
    )
}

export default Paywall

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: "#edf5fe",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#edf5fe",
        height: 60,
    },
    backButton: {
        width: 24, // Fixed width to match icon size
    },
    headerTextContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#3e4e88",
    },
    spacer: {
        width: 24, // Same width as backButton for balance
    },
    loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // or transparent
},
});