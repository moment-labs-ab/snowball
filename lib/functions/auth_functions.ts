import { useSupabaseClient } from '../supabase';

export const deleteUser = async (userId: string): Promise<boolean> => {
    const client = useSupabaseClient();

    const { data, error } = await client.functions.invoke("delete_user", {
        body: { user_id: userId },
        method: "DELETE"
    });

    if (error) {
        console.error("Error creating payment intent:", error);
        return false;
    }

    return true;
}