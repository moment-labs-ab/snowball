
/**
 * Fetch supabase secrets
 */
export const fetchSupabaseSecrets = async() => {
    const SNOWBALL_DB_URL = process.env.SNOWBALL_DB_URL;
    
    const url = `${SNOWBALL_DB_URL}/functions/v1/get-secrets`;
    const response = await fetch(url, {
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
    console.log("Fetched Supabase secrets:", JSON.stringify(data));

    return {
        supabaseUrl: data.url,
        supabaseAnonKey: data.key
    };
}