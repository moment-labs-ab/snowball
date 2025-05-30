import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { upgradeUserToPremium, downgradeUserFromPremium } from "@/lib/supabase_payments";
import { useGlobalContext } from "@/context/Context";

import PremiumPurchasePage from "./PremiumPurchasePage";


interface PremiumModalProps {
    toggleContent: () => void
}
const PremiumModal = ({ toggleContent }: PremiumModalProps) => {
    const { user, setUser, setIsLoading } = useGlobalContext();
    const [selectedOption, setSelectedOption] = useState<"monthly" | "lifetime" | "early_access" | null>(null);

    const handlePurchase = async () => {
        //ADD PURCHASE LOGIC
        if (selectedOption) {
            const result = await upgradeUserToPremium(user.userId, selectedOption)
            if (result.success == false) {
                Alert.alert("Error", result.message);
            } else if (result.success && result.user) {
                setUser((prevUser) => ({
                    ...prevUser,
                    premiumUser: true
                }))
                setIsLoading(false)
            }
        }


        toggleContent()
    };

    const handleDowngrade = async () => {
        const result = await downgradeUserFromPremium(user.userId, "Downgrade")
        if (result.success == false) {
            Alert.alert("Error", result.message);
        } else if (result.success) {
            setUser((prevUser) => ({
                ...prevUser,
                premiumUser: false
            }))
            setIsLoading(false)
        }
        toggleContent()

    };

    if (!user.premiumUser) {
        return (

            <PremiumPurchasePage
                setSelectedOption={setSelectedOption}
                handlePurchase={handlePurchase}
                selectedOption={selectedOption} />
        )
    }
    else {
        return (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity
                    style={[styles.purchaseButton, { backgroundColor: "#E57373", paddingHorizontal: 24 }]}
                    onPress={() =>
                        Alert.alert(
                            "Cancel Membership",
                            "Are you sure you want to cancel your membership?",
                            [
                                { text: "No", style: "cancel" },
                                { text: "Yes, Cancel", style: "destructive", onPress: handleDowngrade },
                            ]
                        )
                    }
                >
                    <Text style={styles.purchaseButtonText}>Cancel Membership</Text>
                </TouchableOpacity>
            </View>

        )

    }
};

const styles = StyleSheet.create({
    purchaseButton: {
        backgroundColor: '#FAC88B',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    purchaseButtonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    purchaseButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    }
});

export default PremiumModal;