// PremiumPurchaseButton.tsx
import React, { useState } from 'react';
import { Button, Alert, Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';
import { createPaymentIntent } from '@/lib/functions/stripe_functions';

type SubscriptionOption = 'monthly' | 'lifetime' | 'early_access' | null;

interface Props {
    subscriptionOption: SubscriptionOption;
}

const PremiumPurchaseButton: React.FC<Props> = ({ subscriptionOption }) => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

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

            await presentPaymentSheet();
            
                // On successful payment, update Supabase
                /*const user = supabase.auth.user();
                if (user) {
                  await supabase
                    .from('users')
                    .update({
                      is_premium: true,
                      stripe_customer_id: customer,
                      subscription_option: subscriptionOption,
                    })
                    .eq('id', user.id);
                }
                setModalVisible(true);
                */
            Alert.alert('Success', 'DELETE: Add Supabase logic here');
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
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <Text style={{ marginBottom: 10 }}>Thank you for upgrading!</Text>
                        <Button
                            title="Go Home"
                            onPress={() => {
                                setModalVisible(false);
                                // @ts-ignore
                                navigation.navigate('Home');
                            }}
                        />
                    </View>
                </View>
            </Modal>
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