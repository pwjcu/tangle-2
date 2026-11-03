import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { approvedPartner } from "./견적권한";
import { readConsultBody } from "./상담입력검증";

export const quoteWorkflowEnabled = () => process.env.QUOTE_WORKFLOW_ENABLED === "true" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function quoteResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function quoteAccess(partner = false) {
  // Enable only after the accompanying RLS migration has been reviewed and tested.
  if (!quoteWorkflowEnabled()) return { error: quoteResponse({ error: "견적 서비스 연결을 준비 중입니다. 상담 준비와 서울 추천 정보는 계속 이용할 수 있어요." }, 503) };
  const store = await cookies();
  const db = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => store.getAll(), setAll: (values) => {
      values.forEach(({ name, value, options }) => store.set(name, value, options));
    } },
  });
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return { error: quoteResponse({ error: "로그인 후 이용해 주세요." }, 401) };
  if (partner && !approvedPartner(user.app_metadata)) return { error: quoteResponse({ error: "승인된 병원 계정만 접근할 수 있습니다." }, 403) };
  return { db, user };
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export async function readQuoteBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new Error("invalid body");
  return readConsultBody(request, 12000);
}
