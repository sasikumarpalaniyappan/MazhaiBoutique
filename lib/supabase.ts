import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const missingEnvError =
  "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).";

type SupabaseClientType = ReturnType<typeof createClient>;

let clientInstance: SupabaseClientType | null = null;

const getSupabase = (): SupabaseClientType => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(missingEnvError);
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return clientInstance;
};

export const supabase = new Proxy({} as SupabaseClientType, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});
export { supabaseUrl };
