import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function provides a Supabase client.
// It's safe to be used in both client and server components.
// It now creates a new client every time to ensure env vars are available.
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not set. Check your .env file.');
  }

  // Create and return a new client every time.
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
