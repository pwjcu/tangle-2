import { quoteAccess, quoteResponse } from "../../../lib/견적서버";
export async function GET() {
  try {
    const access = await quoteAccess(true);
    if (access.error) return access.error;
    const { data, error } = await access.db.from("requests")
      .select("id,category,budget,preferred_area,symptom,created_at")
      .eq("status", "open").order("created_at", { ascending: false }).limit(100);
    if (error) return quoteResponse({ error: "요청 목록을 불러오지 못했습니다." }, 503);
    return quoteResponse({ requests: data || [], clinicName: access.user.app_metadata.tangle_clinic_name || "" });
  } catch { return quoteResponse({ error: "요청 목록을 불러오지 못했습니다." }, 503); }
}
