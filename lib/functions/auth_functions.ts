
export const deleteUser = async (userId: string): Promise<boolean> => {
    try {
        const SNOWBALL_DB_URL = process.env.SNOWBALL_DB_URL;

        const url = `${SNOWBALL_DB_URL}/functions/v1/delete_user`;

      const response = await fetch(url,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            //Authorization: `Bearer ${SUPABASE_ANON_KEY}`, // Use anon key or user session token
          },
          body: JSON.stringify({ user_id: userId })
        }
      );
      //console.log("Function Response:", response.body);

        if (response.ok) {
            //console.log("User deleted successfully");
            return true;
        } else {
            console.error("Error deleting user:", response.body);
            return false;
        }
    } catch (error) {
      console.error("Error calling function:", error);
      return false;
    }
  };