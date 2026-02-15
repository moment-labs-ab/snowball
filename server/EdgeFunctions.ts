/* eslint-disable import/no-unresolved */
import { createClient } from "@supabase/supabase-js";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

interface DeleteUserRequest {
  user_id: string;
}

interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

class DeleteUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteUserError";
  }
}

serve(async (req: Request): Promise<Response> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing Supabase environment configuration" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new DeleteUserError("Authorization token is required");
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !authData.user) {
      throw new DeleteUserError("Invalid authorization token");
    }

    const { user_id }: DeleteUserRequest = await req.json();

    if (!user_id) {
      throw new DeleteUserError("User ID is required");
    }

    if (authData.user.id !== user_id) {
      throw new DeleteUserError("You can only delete your own account");
    }

    const { error } = await supabase.auth.admin.deleteUser(user_id);

    if (error) {
      throw new DeleteUserError(error.message);
    }

    const response: DeleteUserResponse = { success: true };
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const response: DeleteUserResponse = {
      success: false,
      error: error instanceof DeleteUserError ? error.message : "An unexpected error occurred",
    };
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
