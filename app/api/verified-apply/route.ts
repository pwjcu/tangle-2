import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSameOrigin } from "../../../lib/견적서버";
import { applicationText, parseApplication } from "../../../lib/검증신청";
import { rateLimited } from "../../../lib/호출제한";
import { ConsultInputError, readConsultBody } from "../../../lib/상담입력검증";

const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return respond({ error: "요청 출처를 확인할 수 없습니다." }, 403);
  if (rateLimited(req, "verified-apply", 5, 10 * 60_000)) return respond({ error: "잠시 후 다시 시도해 주세요." }, 429);
  try {
    const application = parseApplication(await readConsultBody(req, 12_000));
    if (typeof application === "string") return respond({ error: application }, 400);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // supabase/검증신청.sql 을 실행하고 VERIFIED_APPLY_ENABLED=true 로 켠 뒤에만 저장합니다.
    if (process.env.VERIFIED_APPLY_ENABLED !== "true" || !url || !key) {
      return respond({ saved: false, text: applicationText(application) }, 202);
    }
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await db.from("verification_applications").insert(application);
    if (error) return respond({ saved: false, text: applicationText(application) }, 202);
    return respond({ saved: true }, 201);
  } catch (error) {
    const known = error instanceof ConsultInputError;
    return respond({ error: known ? error.message : "신청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요." }, known ? error.status : 400);
  }
}
