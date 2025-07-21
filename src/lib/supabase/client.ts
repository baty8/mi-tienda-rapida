
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// This file is intended for CLIENT-SIDE use only.

// A singleton instance of the Supabase client.
let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  // If the client is already created, return it.
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If the environment variables are not set, return null.
  // This prevents the app from crashing.
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  // Create the client and store it for future calls.
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
