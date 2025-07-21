
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// This file is intended for CLIENT-SIDE use only.

// A function to get the Supabase client instance.
// This prevents the client from being created on the server during build time.
let supabase: SupabaseClient | null | undefined;

function getSupabase(): SupabaseClient | null {
  if (supabase !== undefined) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are not set. The application will run in a mock mode without database connectivity.');
    supabase = null;
    return supabase;
  }
  
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

// Export the function to be used in client components.
export { getSupabase };
