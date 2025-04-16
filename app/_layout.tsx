import { SplashScreen, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import GlobalProvider from "@/context/Context";
import HabitProvider from "@/context/HabitContext";
import GoalProvider from "@/context/GoalContext";
import TrackingProvider from "@/context/TrackingContext";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

export default function RootLayout() {
  const toastConfig: ToastConfig = {
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "#FAC88B" }} // Change colors here
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 16, fontWeight: "bold", color: "black" }} // Text color
        text2Style={{ fontSize: 14, color: "gray" }} // Subtitle color
      />
    ),
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "green" }} // Change colors here
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 16, fontWeight: "bold", color: "black" }} // Text color
        text2Style={{ fontSize: 14, color: "gray" }} // Subtitle color
      />
    ),
  };
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;
  return (
    <GestureHandlerRootView>

    <GlobalProvider>
      <GoalProvider>
      <HabitProvider>
        <TrackingProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} topOffset={50} />
        </TrackingProvider>
      </HabitProvider>
      </GoalProvider>
    </GlobalProvider>
    </GestureHandlerRootView>
  );
}
