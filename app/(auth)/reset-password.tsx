import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    StyleSheet,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import images from "../../constants/images";
  import { Link, router, useLocalSearchParams } from "expo-router";
  import FormField from "@/components/shared/FormField";
  import CustomButton from "@/components/shared/CustomButtom";
  
  import { resetPassword } from "@/lib/supabase_user";
  import { useGlobalContext } from "@/context/Context";
  
  const ResetPassword = () => {
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const { email, access_token } = useLocalSearchParams();
  
    const [form, setForm] = useState({
        email: email as string,
        accessToken: access_token as string,
        password: "",
        confirmPassword: "",
    });
  
    const [isSubmitting, setisSubmitting] = useState(false);
  
    // TODO: The following needs to be refactored and account for sign in failing.
    const submit = async () => {
      if (form.confirmPassword !== form.password) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      setisSubmitting(true);
      try {
        await resetPassword(form.email, form.accessToken, form.password);
  
        router.replace("/sign-in");
      } catch (error) {
        //Alert.alert(String(error))
      } finally {
        setisSubmitting(false);
      }
    };
    return (
      <ScrollView style={{ backgroundColor: "#edf5fe", height: "100%" }}>
        <View className="w-full justify-center min-h-[75vh] px-4 my-6 mb-65">
          <View style={styles.headerContainer}>
            <Image
              source={images.snowballlogo}
              resizeMode="contain"
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Enter New Password</Text>
          </View>
            <FormField
                title="Password"
                value={form.password}
                handleChangeText={(e: string) => setForm({ ...form, password: e })}
                otherStyles="mt-7 px-2"
                placeholder="Password"
            />

            <FormField
                title="Password"
                value={form.confirmPassword}
                handleChangeText={(e: string) => setForm({ ...form, confirmPassword: e })}
                otherStyles="mt-7 px-2"
                placeholder="Confirm Password"
            />
  
          <CustomButton
            title="Reset"
            handlePress={submit}
            containerStyles="mt-7 px-5 bg-secondary"
            isLoading={isSubmitting}
            otherMethods={() => {}}
          />
        </View>
      </ScrollView>
    );
  };
  
  export default ResetPassword;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingHorizontal: 20,
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 20,
    },
    input: {
      marginTop: 7,
      paddingHorizontal: 8,
    },
    button: {
      marginTop: 20,
    },
    signUpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 15,
    },
    signUpText: {
      fontSize: 16,
      color: "#555",
    },
    signUpLink: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#3e4e88", // Assuming your primary color
      marginLeft: 5,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 20,
    },
    logo: {
      width: 70,
      height: 70,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "500",
    },
  });
  