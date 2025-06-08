import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

import { useSupabaseClient } from "./supabase";
import { Environment } from "./environment/environment";

export async function initRevenueCat(email: string) {
    const client = useSupabaseClient();
    const user = await client.auth.getUser();
    
    // TODO: Configure by environment
    Purchases.setLogLevel(LOG_LEVEL.INFO);

    const apiKey = Platform.select({
        ios: Environment.RC_PUBLIC,
        android: "TODO_ANDROID_API_KEY", // Replace with your actual Android API key
    });

    if (!apiKey) {
        console.error("RevenueCat API key is not set for the current platform.");
        return;
    }

    Purchases.configure({ apiKey: apiKey, appUserID: user.data.user?.id });
    Purchases.setEmail(email);
}

export async function presentPaywall(): Promise<boolean> {
    // Present paywall for current offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
    
    // or if you need to present a specific offering:
    /*const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
        offering: offering // Optional Offering object obtained through getOfferings
    });*/

    switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
            return false;
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
            return true;
        default:
            return false;
    }

}

export async function presentPaywallIfNeeded() {
    // Present paywall for current offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "pro"
    });

    /*// If you need to present a specific offering:
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        offering: offering, // Optional Offering object obtained through getOfferings
        requiredEntitlementIdentifier: "pro"
    });*/
}