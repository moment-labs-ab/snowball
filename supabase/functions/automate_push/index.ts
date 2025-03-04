import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface UserNotification {
  user_id: string;
  expo_push_token: string;
  last_updated: string; // Supabase returns timestamps as strings
}

Deno.serve(async (req) => {
  try {
    // Get current UTC time
    const nowUtc = new Date().toISOString(); // Convert to ISO format for Supabase

    // Query users whose `last_updated` falls within the desired time window
    const { data: users, error } = await supabase
      .from("user_notifications")
      .select("user_id, expo_push_token, last_updated")
      .neq("expo_push_token", null); // Ensure token exists

    if (error) {
      console.log(`Database query failed: ${error.message}`)
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Filter users where their local time is between 7:00 PM and 7:59 PM
    const usersToNotify = users.filter((user: UserNotification) => {
      const userLocalTime = new Date(user.last_updated);
      const localHour = userLocalTime.getHours();
      const localMinutes = userLocalTime.getMinutes();

      return localHour === 19 && localMinutes >= 0 && localMinutes <= 59;
    });

    // Batch update all users who should be notified
    if (usersToNotify.length > 0) {
      const userIds = usersToNotify.map((user: UserNotification) => user.user_id);

      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ last_updated: nowUtc })
        .in("user_id", userIds); // Batch update

      if (updateError) {
        console.log(`Failed to update last_updated: ${updateError.message}`)
        throw new Error(`Failed to update last_updated: ${updateError.message}`);
      }
    }
    console.log(`Updated ${usersToNotify.length} users`)

    return new Response(
      JSON.stringify({ message: `Updated ${usersToNotify.length} users` }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
});
