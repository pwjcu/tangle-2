"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";

export function useQuoteConnection(next: string) {
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has("auth_error")) setError("로그인이 완료되지 않았습니다. 다시 시도해 주세요.");
        const response = await fetch("/api/quote-status", { cache: "no-store", signal: controller.signal });
        const status = await response.json();
        if (current) setEnabled(response.ok && status.enabled === true);
        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          if (current) { setEmail(user?.email || ""); setUserId(user?.id || ""); }
        }
      } catch { if (current) setError("연결 상태를 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요."); }
      finally { if (current) setChecked(true); }
    }
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (current) { setEmail(session?.user.email || ""); setUserId(session?.user.id || ""); }
    });
    return () => { current = false; controller.abort(); subscription.unsubscribe(); };
  }, []);
  const login = useCallback(async () => {
    if (!isSupabaseConfigured) { setError("로그인 연결을 준비 중입니다."); return; }
    try {
      const { error: loginError } = await supabase.auth.signInWithOAuth({ provider: "kakao", options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      } });
      if (loginError) setError("로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } catch { setError("로그인 연결에 실패했습니다. 잠시 후 다시 시도해 주세요."); }
  }, [next]);
  return { enabled, checked, email, userId, error, login };
}

export function QuoteConnectionNotice({ enabled, checked, english = false }: { enabled: boolean; checked: boolean; english?: boolean }) {
  if (!checked) return <p role="status" className="rounded-2xl bg-white p-4 text-sm">{english ? "Checking availability…" : "이용 가능 상태를 확인하고 있어요."}</p>;
  if (enabled) return null;
  return <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7">
    {english ? "Quote delivery is not available yet. You can still prepare consultation notes and browse Seoul recommendations." : "견적 전송은 아직 준비 중이에요. 상담 메모 작성과 서울 추천 정보 탐색은 계속 이용할 수 있습니다."}
  </p>;
}
