import { quoteAccess, quoteResponse } from "../../../lib/견적서버";
export async function GET() {
  try {
    const access = await quoteAccess();
    if (access.error) return access.error;
    const { data, error } = await access.db.from("requests")
      .select("id,category,symptom,budget,created_at,status,bids(id,hospital_name,price,comment,created_at)")
      .eq("user_id", access.user.id).order("created_at", { ascending: false }).limit(100);
    if (error) return quoteResponse({ error: "내 요청을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
    return quoteResponse({ requests: data || [] });
  } catch { return quoteResponse({ error: "내 요청을 불러오지 못했습니다." }, 503); }
}
