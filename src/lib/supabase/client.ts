
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// This file is intended for CLIENT-SIDE use only.

// A function to get the Supabase client instance.
// This prevents the client from being created on the server during build time.
let supabase: SupabaseClient | undefined;

function getSupabase() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
    // Return a mock object or handle it gracefully in the calling component
    // For now, we let createBrowserClient handle the empty strings, but the error is logged.
  }
  
  supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  return supabase;
}

// Export the function to be used in client components.
export { getSupabase };
