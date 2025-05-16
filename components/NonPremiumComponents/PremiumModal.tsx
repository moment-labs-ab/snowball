import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import Entypo from '@expo/vector-icons/Entypo';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { upgradeUserToPremium, downgradeUserFromPremium } from "@/lib/supabase_payments";
import { useGlobalContext } from "@/context/Context";

interface PremiumModalProps{
  toggleContent: ()=>void
}
const PremiumModal = ({toggleContent}: PremiumModalProps) => {
  const {user, setUser, setIsLoading} = useGlobalContext();
  const [selectedOption, setSelectedOption] = useState<"monthly" | "lifetime" | null>(null);

  const handlePurchase = async () => {
    //ADD PURCHASE LOGIC
    if (selectedOption) {
      const result = await upgradeUserToPremium(user.userId, selectedOption)
      if (result.success == false) {
        Alert.alert("Error", result.message);
      } else if (result.success && result.user) {
        setUser((prevUser)=> ({
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
      setUser((prevUser)=> ({
        ...prevUser,
        premiumUser: false
      }))
      setIsLoading(false)
    }
    toggleContent()

  }; 

  const premiumFeatures = [
    "Unlimited Habits",
    "Unlimited Goals",
    "Unlimited Habit Tracking",
    "Accomplish Goals",
    "Archive Goals & Habits",
    "Early access to new features"
  ];

  const freeFeatures = [
    "6 Habits",
    "6 Goals",
    "Limited Tracking",
    "Limited Progress Tracking",
    "Unable to Accomplish Goals",
    "Unable to Archive Goals & Habits"
  ];
  if (! user.premiumUser) {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Snowball <Text style={styles.premiumText}>Premium</Text><MaterialCommunityIcons name="crown" size={28} color="#8BBDFA" />
</Text>
          <Text style={styles.subtitle}>Unlock your full potential</Text>
        </View>
        
        <View style={styles.plansContainer}>
          <Text style={styles.planSectionTitle}>Choose Your Plan</Text>
          
          <TouchableOpacity 
            style={[styles.planOption, selectedOption === "monthly" && styles.planOptionSelected]} 
            onPress={() => setSelectedOption("monthly")}
          >
            <View>
              <Text style={styles.planTitle}>Monthly</Text>
              <Text style={styles.planPrice}>$4.99<Text style={styles.planPeriod}>/month</Text></Text>
            </View>
            <View style={[styles.checkCircle, selectedOption === "monthly" && styles.checkCircleSelected]}>
              {selectedOption === "monthly" && <Entypo name="check" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.planOption, selectedOption === "lifetime" && styles.planOptionSelected]}
            onPress={() => setSelectedOption("lifetime")}
          >
            <View>
              <Text style={styles.planTitle}>Lifetime Membership</Text>
              <Text style={styles.planPrice}>$49.99</Text>
              <Text style={styles.bestValue}>Best value</Text>
            </View>
            <View style={[styles.checkCircle, selectedOption === "lifetime" && styles.checkCircleSelected]}>
              {selectedOption === "lifetime" && <Entypo name="check" size={16} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.purchaseButton, !selectedOption && styles.purchaseButtonDisabled]} 
          onPress={handlePurchase}
          disabled={!selectedOption}
        >
          <Text style={styles.purchaseButtonText}>Get Premium</Text>
        </TouchableOpacity>
        
        <View style={styles.comparePlanContainer}>
          <Text style={styles.comparePlansTitle}>Premium vs. Free</Text>
          
          <View style={styles.planComparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.featureLabel}>Features</Text>
              <Text style={styles.planLabel}>Premium</Text>
              <Text style={styles.planLabel}>Free</Text>
            </View>
            
            {premiumFeatures.map((feature, index) => {
              const freeFeature = freeFeatures[index] || '';
              return (
                <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                  <Text style={styles.featureText}>{feature}</Text>
                  <View style={styles.premiumPlanCell}>
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.freePlanCell}>
                  <Ionicons name="close" size={20} color="#D32F2F" />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  )}
  else{
    return(
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
  scrollView: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#edf5fe',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor:'#edf5fe'
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3e4e88',
    textAlign: 'center',
  },
  premiumText: {
    color: '#FAC88B',
  },
  subtitle: {
    fontSize: 16,
    color: '#525F7F',
    marginTop: 8,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 16,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#8BBDFA',
  },
  planOptionSelected: {
    borderColor: '#8BBDFA',
    backgroundColor: 'rgba(94, 114, 228, 0.08)',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32325D',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8BBDFA',
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8898AA',
  },
  bestValue: {
    fontSize: 12,
    color: '#3e4e88',
    fontWeight: '600',
    marginTop: 4,
    fontStyle:'italic'
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#FAC88B',
    borderColor: '#FAC88B',
  },
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
  },
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
    backgroundColor: '#F7FAFC',
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
    flex: 1,
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
});

export default PremiumModal;