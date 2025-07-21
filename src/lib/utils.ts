import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Client for the browser and server (uses public keys)
export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('CRITICAL ERROR: Missing Supabase URL or Anon Key. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.');
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Admin client for server-side use only (uses the secret service key)
export const createAdminClient = () => {
    if (supabaseAdminInstance) {
        return supabaseAdminInstance;
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('CRITICAL ERROR: Missing Supabase URL or Service Key. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file for admin operations.');
    }

    supabaseAdminInstance = createSupabaseClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
    
    return supabaseAdminInstance;
}
