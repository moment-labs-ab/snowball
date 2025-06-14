import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/supabase_user";
import { User } from "@/types/types";
import { useGlobalContext } from "@/context/Context";
import icons from "@/constants/icons";
import ProfileCard from "@/components/ProfileSettings/ProfileCard";
import HeatMapDisplay from "@/components/ProfileSettings/HeatMapDisplay";
import { StatusBar } from "expo-status-bar";
import FeedbackButton from "@/modals/FeedbackButton";
import Feedback from "@/components/Profile/SettingsFeedback";

const Profile = () => {
  const { user } = useGlobalContext();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false)


  const getUserData = async () => {
    try {
      const userDataPull = await getCurrentUser();
      if (userDataPull) {
        setUserData(userDataPull);
      } else {
        Alert.alert("Error", "Unable to fetch user data");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data");
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getUserData().finally(() => setIsLoading(false));
  }, [user.name]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.content}>
      <StatusBar backgroundColor="#8BBDFA" />

      <View style={styles.container}>
        <View>
          {userData ? (
            <>
              <View style={styles.profileInfo}>
                <ProfileCard
                  profileImage={icons.profileImage}
                  name={user.name}
                  description={"Some description placeholder"}
                  onProfilePicturePress={() => {}}
                />
              </View>
              <View></View>
            </>
          ) : (
            <Text style={styles.errorText}>Unable to load user data</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <HeatMapDisplay />
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

        <View style={styles.divider} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  passwordButton: {
    alignItems: "center",
  },
  password: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 16,
    marginTop: 10,
  },
  container: {
    flex: 1,
    // Equivalent to pl-2 and pr-2
  },
  content: {
    backgroundColor: "#edf5fe", // Replace with your bg-background class color if different
    flex: 1,
    padding: 15,
  },
  profileInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    color: "black",
    fontWeight: "800",
    paddingLeft: 10,
  },
  signOut: {
    marginTop: 10,
    padding: 16,
  },
  dangerZone: {
    marginTop: 10,
    padding: 16,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff4444",
    marginBottom: 16,
  },
  errorText: {
    color: "#ff4444",
    textAlign: "center",
    marginTop: 16,
  },
  settingsButton: {
    alignSelf: "flex-start",
    backgroundColor: "black",
    width: 50,
    height: 50,
    borderRadius: 25, // Makes the image circular
    marginRight: 20,
    marginTop: 15,
  },
  divider: {
    height: 10,
    alignSelf: "center",
    marginTop: 10,
    width: "100%",
  },
});

export default Profile;
