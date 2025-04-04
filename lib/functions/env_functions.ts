/**
 * Fetch supabase secrets
 */
export const fetchSupabaseSecrets = async() => {
    const response = await fetch("https://eykpncisvbuptalctkjx.supabase.co/functions/v1/get-secrets", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Add authorization
        },
    })

    if (!response.ok) {
        console.error("Failed to fetch secrets:", response.statusText);
        return null;
    }

    const data = await response.json();
    
    return {
        supabaseUrl: data.url,
        supabaseAnonKey: data.key
    };
}