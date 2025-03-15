import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import icons from "@/constants/icons";
import Entypo from '@expo/vector-icons/Entypo';


const PremiumModal = () => {
  const [selectedOption, setSelectedOption] = useState<"monthly" | "lifetime" | null>(null);

  const handlePurchase = () => {
    if (selectedOption) {
      console.log(`Purchasing: ${selectedOption}`);
    } else {
      console.log("No option selected");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topics}>
        <Text style={styles.headerTopicText}>Unlock Your Potential With</Text>
      </View>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: "#8BBDFA" }]}>Snowball </Text>
        <Text style={styles.premiumText}>Premium</Text>
      </View>
      
      <View style={styles.featureList}>
        <FeatureItem icon={icons.snowflake} text="Unlimited Habits." />
        <FeatureItem icon={icons.mountain} text="Unlimited Goals." />
        <FeatureItem icon={icons.progress} text="Unlimited Growth." />
      </View>
      
      <View style={styles.optionsContainer}>
        <SubscriptionOption
          title="Monthly"
          price="$4.99/month"
          selected={selectedOption === "monthly"}
          onPress={() => setSelectedOption("monthly")}
        />
        <SubscriptionOption
          title="Buy for Life"
          price="$39.99"
          selected={selectedOption === "lifetime"}
          onPress={() => setSelectedOption("lifetime")}
        />
      </View>
      
      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>Purchase</Text>
      </TouchableOpacity>
    </View>
  );
};

const FeatureItem = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.featureItem}>
    <Image source={icon} style={styles.icon} />
    <Text style={styles.topicText}>{text}</Text>
  </View>
);

const SubscriptionOption = ({ title, price, selected, onPress }: any) => (
  <TouchableOpacity style={[styles.optionBox, selected && styles.optionBoxSelected]} onPress={onPress}>
    <View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionPrice}>{price}</Text>
    </View>
    <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
      {selected && <Entypo name="check" size={20} color="black" />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  topics: {
    flexDirection: "row",
    justifyContent: "center",
  },
  headerTopicText: {
    fontSize: 30,
    fontWeight: "600",
    color: "black",
    fontFamily: "Merriweather",
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 50,
  },
  headerText: {
    fontSize: 42,
    fontWeight: "700",
  },
  premiumText: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FAC88B",
    textDecorationLine: "underline",
  },
  featureList: {
    flexDirection: "column",
    gap: 20,
    marginBottom:40
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    tintColor: "#8BBDFA",
    height: 25,
    width: 25,
    marginRight: 10,
  },
  topicText: {
    fontSize: 28,
    fontWeight: "500",
    color: "black",
    fontFamily: "Merriweather",
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#FAC88B",
    borderRadius: 10,
    padding: 15,
    width: "80%",
    marginBottom: 15,
  },
  optionBoxSelected: {
    backgroundColor: "rgba(250, 200, 139, 0.2)",
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FAC88B",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FAC88B",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleSelected: {
    backgroundColor: "#FAC88B",
  },
  checkMark: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  purchaseButton: {
    marginTop: 20,
    backgroundColor: "#FAC88B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },
});

export default PremiumModal;