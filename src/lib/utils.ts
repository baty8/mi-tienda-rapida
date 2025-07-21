import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let supabaseInstance: SupabaseClient | null = null;

// Singleton pattern to ensure only one instance of Supabase client is used.
export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // This ensures the PKCE flow is used, which is more secure and handles
          // OAuth in SPAs without relying on server-side redirects that can fail in some dev environments.
          flowType: 'pkce',
        },
      }
    );
  }
  return supabaseInstance;
}
