import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getCurrentUser, handleUserDeletion, signOut } from "@/lib/supabase";
import { currentUserType } from "@/types/types";
import CustomButton from "@/components/CustomButtom";
import { useGlobalContext } from "@/context/Context";
import { router } from "expo-router";
import icons from "@/constants/icons";
import { ImageSourcePropType } from "react-native";
import ProfileCard from "@/components/ProfileSettings/ProfileCard";
import SettingsButton from "@/components/SettingsButton";
import Settings from "@/components/ProfileSettings/Settings";
import SettingsHome from "@/components/Profile/SettingsHome";
import HeatMapDisplay from "@/components/ProfileSettings/HeatMapDisplay";

const Profile = () => {
    const { isLoggedIn, setUser, user } = useGlobalContext();
    const [userData, setUserData] = useState<currentUserType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
    }, []);

    // Rest of the logout function remains the same...
    const logout = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Sign Out canceled"),
                    style: "cancel",
                },
                {
                    text: "Sign Out",
                    onPress: async () => {
                        const result = await signOut();
                        if (result.success) {
                            console.log("User Signed out successfully");
                            isLoggedIn.isLoggedIn = false;
                            setUser({
                                email: "",
                                username: "",
                                userId: "",
                            });
                            router.replace("/sign-in");
                        } else {
                            console.error("Error signing user out:", result.message);
                        }
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: async () => {
                        if (!user?.userId) {
                            Alert.alert("Error", "User ID not found");
                            return;
                        }

                        try {
                            setIsDeletingAccount(true);
                            const result = await handleUserDeletion(user.userId);

                            if (result.success) {
                                // Reset global state
                                isLoggedIn.isLoggedIn = false;
                                setUser({
                                    email: "",
                                    username: "",
                                    userId: "",
                                });

                                // Show success message and redirect
                                Alert.alert(
                                    "Success",
                                    "Your account has been deleted successfully",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => router.replace("/sign-in"),
                                        },
                                    ]
                                );
                            } else {
                                throw new Error(result.message);
                            }
                        } catch (error) {
                            Alert.alert(
                                "Error",
                                "Failed to delete account. Please try again later."
                            );
                            console.error("Error deleting account:", error);
                        } finally {
                            setIsDeletingAccount(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };
    const changePasswordRequested = () => {
        console.log("Change Password Requested");
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3e4e88" />
            </View>
        );
    }

  return (
    <SafeAreaView style={styles.content}>
        <View className='flex-1 align-center pl-2 pr-2'>
      <View>
        {userData ? (
          <>
            <View style={styles.profileInfo}>
              <ProfileCard
                profileImage={icons.profileImage}
                name={userData.username}
                description={"Some description placeholder"}
                onProfilePicturePress={() =>
                  console.log("Profile Picture Pressed")
                }
              />
              {/** 
              <SettingsButton
                label="Settings"
                action={() => {
                  console.log("Settings button Pressed");
                }}
                content={<Settings />}
              />
              */}
              <SettingsButton
                label="Settings"
                action={() => {
                  console.log("Settings button Pressed");
                }}
                content={<SettingsHome />}
              />
            </View>
            {/**
                        <View style={styles.signOut}>
                            <CustomButton
                                title="Sign Out"
                                handlePress={logout}
                                containerStyles="mt-8 px-2 bg-secondary"
                                otherMethods={() => { }}
                            />
                        </View>


                        <View style={styles.dangerZone}>
                            <Text style={styles.dangerTitle}>Danger Zone</Text>
                            <CustomButton
                                title={isDeletingAccount ? "Deleting Account..." : "Delete Account & All User Data"}
                                handlePress={handleDeleteAccount}
                                containerStyles="px-2 bg-delete"
                                isLoading={isDeletingAccount}
                                otherMethods={() => { }}
                            />
                        </View>
                        */}
          </>
        ) : (
          <Text style={styles.errorText}>Unable to load user data</Text>
        )}
        </View>
        <HeatMapDisplay />
      
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxSizing: "border-box",
  },
  content: {
    padding: 16,
    height:'100%',
    backgroundColor:'#edf5fe'
  },
  profileInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom:20
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
});

export default Profile;
