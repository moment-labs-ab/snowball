import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import icons from "@/constants/icons";

type TabIconProps = {
  icon: Object;
  color: string;
  name: string;
  focused?: boolean;
};

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View style={[styles.tabContainer, { minWidth: 70 }]}>
      <View style={styles.iconWrapper}>
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          style={styles.icon}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabText,
          styles.textRegular
        ]}
      >
        {name}
      </Text>
      <View style={ { backgroundColor: color }} />
    </View>
  );
};

const ProgressExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        You can do this by creating Goals & Tracking Your Progress in the Profile Tab.
      </Text>
      
      
      <View style={styles.tabsContainer}>
        <TabIcon
          icon={icons.mountain}
          color="#3e4e88"
          name="Goals"
          focused={true}
        />
        <TabIcon
          icon={icons.progress}
          color="#3e4e88"
          name="Progress"
          focused={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical:12
    
  },
  headerText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  tabContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius:50,
    backgroundColor: "#F5F7FF",

  },
  icon: {
    width: 22,
    height: 22,
  },
  tabText: {
    fontSize: 12,
    textAlign: "center",
    width: "100%",
  },
  textFocused: {
    fontWeight: "600",
  },
  textRegular: {
    fontWeight: "400",
  },
  
});

export default ProgressExample;