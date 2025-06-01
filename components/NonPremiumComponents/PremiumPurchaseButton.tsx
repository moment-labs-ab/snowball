// PremiumPurchaseButton.tsx
import React, { useState } from 'react';
import { Button, Alert, Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '@/lib/functions/stripe_functions';
import { Redirect, router } from "expo-router";

type SubscriptionOption = 'monthly' | 'lifetime' | 'early_access' | null;

interface Props {
    subscriptionOption: SubscriptionOption;
    handlePurchase: () => void;
}

const PremiumPurchaseButton: React.FC<Props> = ({ subscriptionOption, handlePurchase}) => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    const openPaymentSheet = async () => {
        setLoading(true);
        try {
            const { paymentIntent, ephemeralKey, customer, publishableKey } = await createPaymentIntent(subscriptionOption!);

            const initResponse = await initPaymentSheet({
                paymentIntentClientSecret: paymentIntent,
                customerEphemeralKeySecret: ephemeralKey,
                customerId: customer,
                defaultBillingDetails: {
                    name: 'Tony Stark',
                },
                merchantDisplayName: 'Moment Labs LLC',
                applePay: {
                    merchantCountryCode: 'US',
                }
            });

            if (initResponse.error) {
                Alert.alert('Error', initResponse.error.message);
                setLoading(false);
                return;
            }

            const { error } = await presentPaymentSheet();

            if (error) {
                if (error.code === "Failed") {
                    Alert.alert('Payment Failed', 'Plase try again later');
                }

                if (error.code === 'Timeout') {
                    Alert.alert('Payment Failed', 'Payment timed out. Please try again.');
                }

                if (error.code === "Canceled") {
                    // Do nothing if the user cancels the payment
                    console.log('Payment canceled by user');
                }
            } else {
                handlePurchase();
            }
        } catch (err) {
            Alert.alert('Error', (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.purchaseButton, !subscriptionOption && styles.purchaseButtonDisabled]}
                onPress={openPaymentSheet}
                disabled={loading || !subscriptionOption}
            >
                {loading ? <Text>Processing...</Text> : <Text style={styles.purchaseButtonText}>Get Premium</Text>}
            </TouchableOpacity>
        </>
    );
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

export default PremiumPurchaseButton;