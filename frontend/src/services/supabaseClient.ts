import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.refreshSession();
  const token = data.session?.access_token;
  if (!token || error) {
    const { data: existing } = await supabase.auth.getSession();
    const fallback = existing.session?.access_token;
    if (!fallback) return {};
    return { Authorization: `Bearer ${fallback}` };
  }
  return { Authorization: `Bearer ${token}` };
}

export const auth = {
  signUp: (email: string, password: string, fullName: string) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),

  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),
};
