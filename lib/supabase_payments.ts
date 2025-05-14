import "react-native-url-polyfill/auto";
import { PostgrestError } from "@supabase/supabase-js";
import { Habit, HabitTracking } from "@/types/types";
import { useSupabaseClient } from "./supabase";
import { User } from "@/types/types";

export const upgradeUserToPremium = async (
  userId: string,
  plan: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  console.log("User upgrading to premium: ", plan);
  const client = useSupabaseClient();

  const { data, error } = await client
    .from("profiles")
    .update({
      premium_user: true,
    })
    .eq("id", userId)
    .select()
    .single(); // Ensures `data` is a single object, not an array

  if (error || !data) {
    console.error("Error updating to premium:", error);
    return {
      success: false,
      message: "There was an error updating to Snowball Premium.",
    };
  }

  return {
    success: true,
    message: "Successfully Upgraded to Premium!",
    user: data as User,
  };
};


export const downgradeUserFromPremium = async(
    userId: string,
    plan: string,
): Promise<{ success: boolean; message: string; }> => {
    console.log("User upgrading to premium: ", plan)
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