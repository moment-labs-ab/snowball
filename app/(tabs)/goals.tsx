import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AddGoalButton from "@/components/GoalObjects/AddGoalButton";
import AddGoalForm from "@/components/GoalObjects/AddGoalForm";
import AllGoalsView from "@/components/GoalObjects/AllGoalsView";
import { useGlobalContext } from "@/context/Context";
import { useGoalContext } from "@/context/GoalContext";
import FeedbackButton from "@/modals/FeedbackButton";
import Feedback from "@/components/Profile/SettingsFeedback";

const goals = () => {
  const { user } = useGlobalContext();
  const { goals } = useGoalContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.flexRow}>
          <View>
            <View style={[styles.flexRow, styles.headerRow]}>
              <Text style={styles.headerText}>Goals</Text>
            </View>
            <View style={[styles.flexRow, styles.subHeaderRow]}>
              <Text style={styles.subHeaderText}>Who do you want to be?</Text>
            </View>
          </View>
          {goals.length !== 0 && (
            <AddGoalButton
              label="Create a New Goal"
              content={<AddGoalForm />}
            />
          )}
        </View>
        <View style={styles.divider} />
        <View style={{ flex: 1 }}>
          <AllGoalsView />
          {feedbackVisible && (
            <View
              style={{
                position: "absolute",
                alignContent: "flex-end",
                bottom: 20,
                right: 0,
                backgroundColor: "transparent",
                zIndex: 10,
              }}
            >
              <FeedbackButton
                label="Feedback"
                content={<Feedback />}
                style={{
                  width: 48,
                  height: 48,
                }}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#edf5fe", // Replace with your bg-background class color if different
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8, // Equivalent to pl-2 and pr-2
  },
  visionCard: {
    width: 375,
    height: 90,
    backgroundColor: "#edf5fe",
    borderRadius: 8,
    marginBottom: 10,
    backfaceVisibility: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  headerRow: {
    marginTop: 24, // Equivalent to mt-6
  },
  subHeaderRow: {
    marginTop: 4, // Equivalent to mt-1
    marginBottom: 4, // Equivalent to mb-1
  },
  headerText: {
    fontSize: 20, // Equivalent to text-xl
    fontWeight: "bold",
    color: "#3e4e88", // Replace with text-secondary class color if different
    paddingLeft: 8, // Equivalent to pl-2
  },
  subHeaderText: {
    fontSize: 16, // Equivalent to text-l
    fontWeight: "bold",
    color: "#8BBDFA", // Replace with text-primary class color if different
    paddingLeft: 8, // Equivalent to pl-2
  },
  iconButton: {
    backgroundColor: "#3e4e88", // Replace with bg-secondary class color if different
    borderRadius: 999, // Makes it circular
    width: 48, // Equivalent to w-12
    height: 48, // Equivalent to h-12
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8, // Equivalent to ml-3 and mr-3
  },
  divider: {
    height: 2,
    width: "98%",
    backgroundColor: "#3e4e88", // Replace with your color
    alignSelf: "center",
    marginTop: 10,
  },
});

export default goals;
