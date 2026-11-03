import { boundedText, positivePrice } from "../../../lib/견적권한";
import { isSameOrigin, quoteAccess, quoteResponse, readQuoteBody } from "../../../lib/견적서버";
import { buildBidComment } from "../../../lib/bids";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return quoteResponse({ error: "요청 출처를 확인할 수 없습니다." }, 403);
  try {
    const access = await quoteAccess(true);
    if (access.error) return access.error;
    const body = await readQuoteBody(request);
    const requestId = body.request_id;
    const price = positivePrice(body.price);
    const plan = boundedText(body.plan, 500);
    const reason = boundedText(body.reason, 1500);
    const reservation = boundedText(body.reservation, 1000);
    const clinicName = boundedText(access.user.app_metadata.tangle_clinic_name, 100);
    if (!clinicName) return quoteResponse({ error: "계정에 승인된 병원명이 등록되어 있지 않습니다." }, 403);
    if (typeof requestId !== "number" || !Number.isSafeInteger(requestId) || requestId <= 0 || !price || !plan || !reason || !reservation) {
      return quoteResponse({ error: "가격, 시술 구성, 제안 이유와 상담 안내를 확인해 주세요." }, 400);
    }
    const { data: open, error: lookupError } = await access.db.from("requests").select("id").eq("id", requestId).eq("status", "open").maybeSingle();
    if (lookupError || !open) return quoteResponse({ error: "제안할 수 있는 열린 요청이 아닙니다." }, 409);
    const { error } = await access.db.from("bids").insert({ request_id: requestId, clinic_user_id: access.user.id,
      hospital_name: clinicName, price, comment: buildBidComment({ plan, reason, reservation }), selected: false });
    if (error?.code === "23505") return quoteResponse({ error: "이 요청에 이미 제안을 보냈습니다." }, 409);
    if (error) return quoteResponse({ error: "제안을 저장하지 못했습니다. 입력 내용은 그대로 남아 있습니다." }, 503);
    return quoteResponse({ ok: true }, 201);
  } catch { return quoteResponse({ error: "제안을 처리하지 못했습니다. 입력 내용을 확인해 주세요." }, 400); }
}
