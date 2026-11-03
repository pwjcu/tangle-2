import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && key);

// Keep public pages renderable without credentials; placeholder fetch never reaches a network.
export const supabase = createBrowserClient(
  url || "https://unconfigured.invalid",
  key || "unconfigured-public-key",
  isSupabaseConfigured ? undefined : {
    global: { fetch: async () => new Response(JSON.stringify({ message: "로그인 연결을 준비 중입니다." }), {
      status: 503, headers: { "Content-Type": "application/json" },
    }) },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  },
);
