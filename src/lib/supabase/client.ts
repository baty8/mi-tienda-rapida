import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js';

// This file is intended for CLIENT-SIDE use only.

let supabase: SupabaseClient | undefined;

function getSupabaseBrowserClient() {
  if (supabase) {
    return supabase;
  }

  // Only create a new client if one doesn't exist.
  // This is safe to run in the browser.
  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return supabase;
}

// Export a single instance of the client
export const supabase = getSupabaseBrowserClient();