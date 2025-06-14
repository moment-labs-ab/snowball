import "react-native-url-polyfill/auto";
import { useSupabaseClient } from "./supabase";
import { User } from "@/types/types";
import Purchases from "react-native-purchases";

/**
 * Updates the user's profile to premium and creates a purchase record.
 * Will need to be updated to handle different premium types.
 */
export const updateUserWithPremium = async (): Promise<User | null> => {
    const client = useSupabaseClient();
    const user = await client.auth.getUser();
    
    const { data, error } = await client
        .from("profiles")
        .update({
            premium_user: true,
        })
        .eq("id", user.data.user?.id)
        .select()
        .single(); // Ensures `data` is a single object, not an array

    if (error || !data) {
        //console.error("Error updating to premium:", error);
        return null;
    }

    const customerInfo = await Purchases.getCustomerInfo()
    
    const { data: purchase, error: purchaseError } = await client
        .from("purchases")
        .upsert([
            {
                premium_type: "early_access", // or "monthly" or "lifetime"
                status: "active",
                customer_id: customerInfo.originalAppUserId
            },
        ])
        .select()
        .single();
    
    if (purchaseError || !purchase) {
        //console.error("Error creating purchase record:", purchaseError);
        return null;
    }

    return data as User;
}

export const downgradeUserFromPremium = async(
    userId: string,
    plan: string,
): Promise<{ success: boolean; message: string; }> => {
    const client = useSupabaseClient();
    const { data, error } = await client
            .from("profiles")
            .update([
                {
                    premium_user: false
                },
            ])
            .eq('id', userId)
    if (error) {
        console.error("Error downgrading user user:", error);
        return { success: false, message: "There was an error downgrading from Snowball Premium." };
    }
    else{
        return { success: true, message: "Successfully Downgraded User"};
    }
}

export const restoreUserWithPremium = async (): Promise<User | null> => {
    const client = useSupabaseClient();
    const user = await client.auth.getUser();
    
    const { data, error } = await client
        .from("profiles")
        .update({
            premium_user: true,
        })
        .eq("id", user.data.user?.id)
        .select()
        .single(); // Ensures `data` is a single object, not an array

    if (error || !data) {
        console.error("Error restoring to premium:", error);
        return null;
    }

    const customerInfo = await Purchases.getCustomerInfo()
    
    const { data: purchase, error: purchaseError } = await client
        .from("purchases")
        .upsert([
            {
                premium_type: "early_access", // or "monthly" or "lifetime"
                status: "active",
                customer_id: customerInfo.originalAppUserId
            },
        ])
        .select()
        .single();
    
    if (purchaseError || !purchase) {
        console.error("Error creating purchase record:", purchaseError);
        return null;
    }

    return data as User;
}

export const getUserPremiumStatus = async (): Promise<any> => {
    const client = useSupabaseClient();
    const user = await client.auth.getUser();

    const { data, error } = await client
        .from("purchases")
        .select("*")
        .eq("user_id", user.data.user?.id)
        .single();

    if (error) {
        return null;
    }

    const purchaseData = {
        premiumType: data.premium_type,
        status: data.status,
        customerId: data.customer_id,
        createdAt: data.created_at,
    }

    return purchaseData;
}

