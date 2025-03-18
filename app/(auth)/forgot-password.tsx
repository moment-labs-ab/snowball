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
  import { Link, router } from "expo-router";
  import FormField from "../../components/FormField";
  import CustomButton from "@/components/CustomButtom";
  
  import { sendResetPasswordEmail } from "@/lib/supabase";
  import { Session } from "@supabase/supabase-js";
  import { supabase } from "@/lib/supabase";
  import GlobalProvider, { useGlobalContext } from "@/context/Context";
  import { useContext } from "react";
  
  const ForgotPassword = () => {
    const { setUser, setIsLoggedIn } = useGlobalContext();
  
    const [form, setForm] = useState({
      email: "",
    });
  
    const [isSubmitting, setisSubmitting] = useState(false);
  
    // TODO: The following needs to be refactored and account for sign in failing.
    const submit = async () => {
      if (form.email === "") {
        //Alert.alert("Error", "Please fill in all the fields");
      }
      setisSubmitting(true);
      try {
        await sendResetPasswordEmail(form.email);
        Alert.alert("Email Sent!", "Check your email for the reset link");

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
            <Text style={styles.headerTitle}>Reset Your Password</Text>
          </View>
  
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7 px-2"
            keyboardType="email-address"
            placeholder="Email"
          />
  
          <CustomButton
            title="Send Reset Link"
            handlePress={submit}
            containerStyles="mt-7 px-5 bg-secondary"
            isLoading={isSubmitting}
            otherMethods={() => {}}
          />
          
          <View className="justify-center pt-5 flex-row gap-2 mb-100">
            <Text className="text-lg text-black-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  };
  
  export default ForgotPassword;
  
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
  