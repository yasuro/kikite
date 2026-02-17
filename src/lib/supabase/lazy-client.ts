import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getLazySupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return supabaseClient;
}