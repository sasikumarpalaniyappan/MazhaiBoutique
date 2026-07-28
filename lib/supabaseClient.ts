import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const missingEnvError =
  "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).";

type SupabaseClientType = ReturnType<typeof createClient>;

let clientInstance: SupabaseClientType | null = null;

const getSupabaseClient = (): SupabaseClientType => {
  if (!hasSupabaseEnv) {
    throw new Error(missingEnvError);
  }

  const url = supabaseUrl as string;
  const anonKey = supabaseAnonKey as string;

  if (!clientInstance) {
    clientInstance = createClient(url, anonKey);
  }

  return clientInstance;
};

// Lazy client so module evaluation during SSR/prerender does not throw.
export const supabaseClient = new Proxy({} as SupabaseClientType, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient(), prop, receiver);
  },
});
export { supabaseUrl };
