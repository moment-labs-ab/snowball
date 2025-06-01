import { SplashScreen, Stack } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import React, { useEffect, useState, useRef } from "react";
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
import ExpoStripeProvider from "@/context/ExpoStripeProvider";

export default function RootLayout() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const appState = useRef(AppState.currentState);

    // Function to check and update the current date
    const checkAndUpdateDate = () => {
        const now = new Date();
        if (now.toDateString() !== currentDate.toDateString()) {
            setCurrentDate(now); // this triggers a re-render of the layout
        }
    };

    useEffect(() => {
        // Check every minute
        const interval = setInterval(() => {
            checkAndUpdateDate();
        }, 60000);

        return () => clearInterval(interval);
    }, [currentDate]);

    useEffect(() => {
        // Also check when app comes back into foreground
        const sub = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                checkAndUpdateDate();
            }
            appState.current = nextAppState;
        });

        return () => sub.remove();
    }, []);

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
                <ExpoStripeProvider>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                    <Toast config={toastConfig} topOffset={50} />
                </ExpoStripeProvider>
                </TrackingProvider>
                </HabitProvider>
                </GoalProvider>
            </GlobalProvider>
        </GestureHandlerRootView>
    );
}
