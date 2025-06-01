import Constants from 'expo-constants';
import { useSupabaseClient } from '../supabase';

const { SNOWBALL_DB_URL } = Constants.expoConfig?.extra ?? {};

/*export const getPaymentSheetParams = async (): Promise<any> => {
    try {
        const url = `${SNOWBALL_DB_URL}/functions/v1/stripe_payment_intent`;

        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    //Authorization: `Bearer ${SUPABASE_ANON_KEY}`, // Use anon key or user session token
                },
                //body: JSON.stringify({ user_id: userId })
            }
        );
        //console.log("Function Response:", response.body);

        if (response.ok) {
            const { paymentIntent, ephemeralKey, customer } = await response.json();
            console.log("Payment Intent created successfully: ", paymentIntent, ephemeralKey, customer);

            return {
                paymentIntent,
                ephemeralKey,
                customer
            };
        } else {
            console.error("Error deleting user:", response.body);
            return {};
        }
    } catch (error) {
        console.error("Error calling function:", error);
        return {};
    }
};*/

export const createPaymentIntent = async (productId: string): Promise<any> => {
    const client = useSupabaseClient();

    const { data, error } = await client.functions.invoke("stripe_create_intent", {
        body: { productId: productId},
        method: "POST"
    });

    if (error) {
        console.error("Error creating payment intent:", error);
        return null;
    }

    return data as {
        paymentIntent: string;
        ephemeralKey: string;
        customer: string;
        publishableKey: string;
    };
}