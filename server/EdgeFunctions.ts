import { createClient } from "@supabase/supabase-js";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = 'https://eykpncisvbuptalctkjx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3BuY2lzdmJ1cHRhbGN0a2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAxMTQ3MzgsImV4cCI6MjAzNTY5MDczOH0.mULscPjrRARbUp80OnVY_GQGUYMPhG6k-QCvGTZ4k3g'


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
      this.name = 'DeleteUserError';
    }
  }
  
  serve(async (req: Request): Promise<Response> => {
    const supabase = createClient(
        supabaseUrl,
        supabaseAnonKey
    )
  
    try {
      const { user_id }: DeleteUserRequest = await req.json()
  
      if (!user_id) {
        throw new DeleteUserError('User ID is required')
      }
  
      const { error } = await supabase.auth.admin.deleteUser(user_id)
  
      if (error) {
        throw new DeleteUserError(error.message)
      }
  
      const response: DeleteUserResponse = { success: true }
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (error) {
      const response: DeleteUserResponse = { 
        success: false, 
        error: error instanceof DeleteUserError ? error.message : 'An unexpected error occurred'
      }
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  })