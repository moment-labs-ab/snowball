import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { useGlobalContext } from "@/context/Context";
import { router } from "expo-router";
import { getCurrentUser, handleUserDeletion, signOut } from "@/lib/supabase";
import {
  ProfileSelectState,
  ProfileToggleState,
} from "@/components/Profile/Types";
import Setting from "@/components/Profile/Setting";
import SettingsGoals from "./SettingsGoals";
import SettingsHabits from "./SettingsHabits";
import icons from "@/constants/icons";
import Feedback from "./SettingsFeedback";
import ProfileStats from "../ProfileSettings/ProfileStats";
import SingleNotificationPage from "../ProfileSettings/SingleNotification";
import TermsAndConditions from "../ProfileSettings/TermsAndConditions";
import PrivacyPolicy from "../ProfileSettings/PrivacyPolicy";
import { registerForPushNotificationsAsync } from "@/lib/supbase_notifications";
import PremiumModal from "../NonPremiumComponents/PremiumModal";
import { deleteUser } from "@/lib/functions/auth_functions";

const SECTION = [
  {
    header: "Profile",
    items: [
      {
        id: "name",
        iconType: "feather",
        icon: "user",
        label: "Name",
        type: "select",
        content: <View />,
      },
      {
        id: "email",
        iconType: "feather",
        icon: "mail",
        label: "Email",
        type: "select",
        content: <View />,
      },
      {
        id: "password",
        iconType: "feather",
        icon: "lock",
        label: "Password",
        type: "select",
        content: <View />,
      },
      {
        id: "logout",
        iconType: "feather",
        icon: "power",
        label: "Logout",
        type: "modal",
        content: <View />,
      },
      {
        id: "delete-account",
        iconType: "feather",
        icon: "trash",
        label: "Delete Account",
        type: "danger",
        content: <View />,
      },
    ],
  },
  {
    header:'Premium',
    items:[
      {
        id:"premium",
        iconType:'material',
        icon:'crown',
        label:'Premium',
        type:'page',
        content: <PremiumModal />
      }
    ]
  },
  {
    header: "Snowball",
    items: [
      {
        id: "habits",
        iconType: "local",
        icon: icons.snowflake,
        label: "Habits",
        type: "page",
        content: <SettingsHabits />,
      },
      {
        id: "goals",
        iconType: "local",
        icon: icons.mountain,
        label: "Goals",
        type: "page",
        content: <SettingsGoals />,
      },
      {
        id: "profile-stats",
        iconType: "feather",
        icon: "bar-chart-2",
        label: "Profile Stats",
        type: "page",
        content: <ProfileStats />,
      },
    ],
  },
  {
    header: "Other",
    items: [
      {
        id: "notifications",
        iconType: "feather",
        icon: "bell",
        label: "Notifications",
        type: "page",
        content: <SingleNotificationPage />,
      },
      {
        id: "terms",
        iconType: "feather",
        icon: "feather",
        label: "Terms & Conditions",
        type: "page",
        content: <TermsAndConditions />,
      },
      {
        id: "privacy-policy",
        iconType: "feather",
        icon: "shield",
        label: "Privacy Policy",
        type: "page",
        content: <PrivacyPolicy />,
      },

      {
        id: "feedback",
        iconType: "feather",
        icon: "inbox",
        label: "Feedback",
        type: "page",
        content: <Feedback />,
      },
      //{ id: 'bug', iconType: 'feather', icon: 'alert-circle', label: 'Report Bug', type: 'page', content:<View/>  },
      //{ id: 'donate', iconType: 'feather', icon: 'dollar-sign', label: 'Donate', type: 'page', content:<View/>  },
    ],
  },
];

const SettingsHome = () => {
  const { isLoggedIn, setIsLoggedIn, setUser, user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const getUserData = async () => {
    try {
      const userDataPull = await getCurrentUser();
      if (userDataPull) {
        setUser(userDataPull);
      } else {
        Alert.alert("Error", "Unable to fetch user data");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user data");
      console.error("Error fetching user data:", error);
    }
  };

  const logoutClicked = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("log Out canceled"),
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              console.log("User Signed out successfully");
              setIsLoggedIn(false);
              setUser({
                email: "",
                username: "",
                userId: "",
                premiumUser: false,
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

  // This needs to be done differently
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
              const result = await deleteUser(user.userId);

              if (result) {
                // Reset global state
                setIsLoggedIn(false);
                setUser({
                  email: "",
                  username: "",
                  userId: "",
                  premiumUser: false,
                });

                // Show success message and redirect
                Alert.alert(
                  "Success",
                  "Your account has been deleted successfully",
                  [
                    {
                      text: "OK",
                      onPress: () => {},
                    },
                  ]
                );

                router.replace("/");
              } else {
                Alert.alert(
                    "Error",
                    "Failed to delete account. Please try again later."
                  );
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

  useEffect(() => {
    setIsLoading(true);
    getUserData().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSelect({
      name: user.username || "",
      email: user.email || "",
      password: "",
    });
  }, [user]);

  const [toggle, setToggle] = useState<ProfileToggleState>({
    logout: false,
  });

  const [select, setSelect] = useState<ProfileSelectState>({
    name: "",
    email: "",
    password: "",
  });

  const [expoPushToken, setExpoPushToken] = useState("");
  const handleNotificationToggle = () => {
    registerForPushNotificationsAsync().then(async (token) => {
        setExpoPushToken(token);

      //updateUserExpoPushToken(user.userId, token)
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3e4e88" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView>
        {user ? (
          <SafeAreaView style={{ backgroundColor: "#edf5fe", height: "100%" }}>
            {SECTION.map(({ header, items }) => (
              <View style={styles.section} key={header}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{header}</Text>
                </View>

                <View>
                  {items.map(
                    ({ label, id, type, iconType, icon, content }, index) => (
                      <Setting
                        label={label}
                        accountSetting={type}
                        index={index}
                        iconType={iconType}
                        icon={icon}
                        id={id}
                        selectValue={select[id as keyof typeof select]}
                        toggleValue={toggle[id as keyof typeof toggle]}
                        toggleSetState={setToggle}
                        content={content}
                        handleTouch={logoutClicked}
                        handleDeleteTouch={handleDeleteAccount}
                      />
                    )
                  )}
                </View>
              </View>
            ))}
            <View></View>
          </SafeAreaView>
        ) : (
          <Text style={styles.errorText}>Unable to load user data</Text>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default SettingsHome;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    boxSizing: "border-box",
    backgroundColor: "#edf5fe",
  },
  section: {
    paddingTop: 12,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#a7a7a7",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  rowWrapper: {
    paddingLeft: 24,
    borderTopWidth: 1,
    borderColor: "#e3e3e3",
    backgroundColor: "#fff",
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 10,
  },
  row: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 24,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#212121",
  },
  rowSpacer: {
    flex: 1,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: "500",
    color: "#616161",
    marginRight: 4,
  },
  errorText: {
    color: "#ff4444",
    textAlign: "center",
    marginTop: 16,
  },
});
