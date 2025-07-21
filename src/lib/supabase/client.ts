import { createBrowserClient } from '@supabase/ssr'

// This file is intended for CLIENT-SIDE use only.

// Create a single, shared Supabase client for the browser
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
