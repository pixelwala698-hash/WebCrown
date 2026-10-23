import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export async function signInWithPassword(email, password) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: null,
      error: new Error("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."),
    };
  }

  try {
    return await client.auth.signInWithPassword({ email, password });
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function signOut() {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  try {
    return await client.auth.signOut();
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export function getSupabaseSession() {
  const client = getSupabaseClient();
  return client ? client.auth.getSession() : Promise.resolve({ data: { session: null }, error: null });
}
