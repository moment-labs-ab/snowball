import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const premiumFeatures = [
    "Unlimited Habits",
    "Unlimited Goals",
    "Unlimited Habit Tracking",
    "Accomplish Goals",
    "Archive Goals & Habits",
    "Access to new features"
];

const freeFeatures = [
    "6 Habits",
    "6 Goals",
    "Limited Tracking",
    "Limited Progress Tracking",
    "Unable to Accomplish Goals",
    "Unable to Archive Goals & Habits"
];

const PremiumComparisonTable = () => {
    return (
        <View style={styles.comparePlanContainer}>

            <View style={styles.planComparisonTable}>
                <View style={styles.tableHeader}>
                    <View style={{paddingVertical: 6, }}>
                        <Text style={styles.featureLabel}>Features</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <View style={{paddingVertical: 6, }}>
                            <Text style={styles.planLabel}>Free</Text>
                        </View>
                        <View style={{ paddingLeft:24 }}>
                            <View style={styles.planLabelWrapper}>
                                <Text style={styles.planLabel}>Premium</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {premiumFeatures.map((feature, index) => {
                    const freeFeature = freeFeatures[index] || '';
                    return (
                        <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                            <Text style={styles.featureText}>{feature}</Text>

                            <View style={styles.freePlanCell}>
                                <Ionicons name="close" size={20} color="#D32F2F" />
                            </View>
                            <View style={styles.premiumPlanCell}>
                                <Ionicons name="checkmark" size={20} color="#4CAF50" />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    )
}

export default PremiumComparisonTable

const styles = StyleSheet.create({
    comparePlanContainer: {
        marginTop: 16,
    },
    comparePlansTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E2E2E',
        marginBottom: 16,
    },
    planComparisonTable: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between', // spreads cells
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    featureLabel: {
        flex: 2,
        fontWeight: '600',
        color: '#32325D',
    },
    planLabel: {
        fontWeight: '600',
        textAlign: 'center',
        color: '#32325D',
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowEven: {
        backgroundColor: '#FFFFFF',
    },
    rowOdd: {
        backgroundColor: '#F7FAFC',
    },
    featureText: {
        flex: 2,
        color: '#525F7F',
    },
    freePlanCell: {
        flex: 1,
        alignItems: 'center',
    },
    premiumPlanCell: {
        flex: 1,
        alignItems: 'center',
    },
    limitText: {
        color: '#FFA000',
        fontWeight: '500',
    },
    planLabelWrapper: {
        borderColor: '#FAC88B',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 6, // wider left/right padding
        paddingVertical: 6,    // taller top/bottom padding
        alignSelf: 'flex-start',
        opacity: 0.9,
        backgroundColor: '#FAC88B'        // subtle increase for visibility
    },
});