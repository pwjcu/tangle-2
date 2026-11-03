import { boundedText, positivePrice } from "../../../lib/견적권한";
import { isSameOrigin, quoteAccess, quoteResponse, readQuoteBody } from "../../../lib/견적서버";
import { treatmentCategories } from "../../../lib/siteContent";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return quoteResponse({ error: "요청 출처를 확인할 수 없습니다." }, 403);
  try {
    const access = await quoteAccess();
    if (access.error) return access.error;
    const body = await readQuoteBody(request);
    const budget = positivePrice(body.budget);
    const category = boundedText(body.category, 40);
    const symptom = boundedText(body.symptom, 2000, 5);
    const area = boundedText(body.preferred_area, 100);
    if (!budget || !category || !symptom || !area || body.consent !== true ||
      ![...treatmentCategories.map((item) => item.name), "기타"].includes(category)) {
      return quoteResponse({ error: "예산, 카테고리, 선호 지역, 고민 내용과 공유 동의를 확인해 주세요." }, 400);
    }
    if (!access.user.email) return quoteResponse({ error: "이메일이 확인된 계정으로 로그인해 주세요." }, 400);
    const { error } = await access.db.from("requests").insert({
      user_id: access.user.id, user_email: access.user.email,
      category, budget, preferred_area: area, symptom, status: "open",
    });
    if (error) return quoteResponse({ error: "요청을 저장하지 못했습니다. 입력 내용은 그대로 남아 있습니다." }, 503);
    return quoteResponse({ ok: true }, 201);
  } catch { return quoteResponse({ error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 400); }
}
