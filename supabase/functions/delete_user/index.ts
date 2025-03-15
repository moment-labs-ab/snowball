import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const dbUrl = Deno.env.get("SUPABASE_URL") as string;
const dbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const supabase = createClient(dbUrl, dbKey);

Deno.serve(async (req) => {
    if (req.method !== "DELETE") {
        return new Response("Method Not Allowed", { status: 405 });
    }
    
    const { user_id } = await req.json();
    if (!user_id) {
        return new Response("Missing UserId", { status: 400 });
    }

    const tables = ["goal_habits_reference", "goal_objects", "habit_tracking", "habit_tracking_history", "habits", "user_logins", "user_notifications"];
    for (const table of tables) {
        const { count, error } = await supabase.from(table).delete({count: "exact"}).eq("user_id", user_id);
        if (error) {
            console.error(`Error deleting data from ${table}:`, error);
            return new Response(`Error deleting data from ${table}`, { status: 500 });
        }
        else {
            console.log(`Deleted ${count} rows from ${table} for user ID:`, user_id);
        }
    }

    const { error: profileError } = await supabase.from("profiles").delete().eq("id", user_id);
    if (profileError) {
        console.error("Error deleting profile data:", profileError);
        return new Response("Error deleting profile data", { status: 500 });
    }
    else {
        console.log("Profile data deleted successfully for user ID:", user_id);
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
    if (authError) {
        console.error("Error deleting auth data:", authError);
        return new Response("Error deleting auth data", { status: 500 });
    }
    else {
        console.log("Auth data deleted successfully for user ID:", user_id);
    }

    return new Response("User data deleted successfully", { status: 200 });
});
