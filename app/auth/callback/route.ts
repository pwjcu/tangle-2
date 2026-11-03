import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { safeReturnPath } from "../../../lib/견적권한";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL(safeReturnPath(url.searchParams.get("next")), url.origin);
  const failure = () => {
    destination.searchParams.set("auth_error", "1");
    return NextResponse.redirect(destination);
  };
  const code = url.searchParams.get("code");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!code || !supabaseUrl || !key) return failure();
  const response = NextResponse.redirect(destination);
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const db = createServerClient(supabaseUrl, key, {
      cookies: { getAll: () => store.getAll(), setAll: (values) => {
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      } },
    });
    const { error } = await db.auth.exchangeCodeForSession(code);
    return error ? failure() : response;
  } catch { return failure(); }
}
