import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";
const require = createRequire(import.meta.url);
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete process.env.QUOTE_WORKFLOW_ENABLED;
const root = path.resolve(import.meta.dirname, "..");
const recommendations = require(path.join(root, "lib/서울경험추천.ts"));
const items = recommendations.clinicRecommendations;
assert.equal(items.length, 25);
assert.equal(new Set(items.map((item) => item.id)).size, 25);
const expected = {
  "skin-injections": ["네스트의원", "이경연"], "rituo": ["닥터미 의원", "전윤주", "이서하"],
  "gouri": ["데이터 부족"], "sofwave-toning-hair-removal": ["신사디온", "박지영"],
  "custom-hand-injections": ["드네의원", "신예진", "소은의원", "김소은"],
  "thread-lifting-fillers": ["압토스", "페이스플러스", "박정근", "창피부과", "김창식"],
  "acne-scars": ["창피부과", "김창식"], "acne-hair-removal": ["채선경", "선릉 라엘르", "대치동?"],
  "hair-transplant": ["비절개", "참닥터", "김주용"], "nose": ["이지성", "자가늑", "안승현", "김주연"],
  "facial-contouring": ["안승현", "박정근"], "eyes": ["배인호"], "breast": ["데이터 부족"],
  "fat-removal": ["비공개"], "under-eyes": ["데이터 부족"], "face-lift": ["온리프", "제이준", "브라운", "닥터미"],
  "profound": ["닥터스의원 신사", "성현철", "기계 없앤다함"],
  "thermage": ["바비리팅 의원", "원장님들"], "shape-consulting": ["창피부과", "김창식"],
  "eyebrow-tattoo": ["드보라 성형외과"], "renuvion-general-skin": ["리뉴비온", "신사 더힐"],
  "inmode": ["시간보장", "뷰티앤영"], "ulthera-thermage-output": ["강한 출력", "뷰앤플 의원"],
  "body-care": ["모드니", "바디웰", "터한의원"], "massage": ["레비나스", "드네의원", "어메이징빅토리아", "금단비가", "약손명가", "위뷰티"],
};
for (const [id, keywords] of Object.entries(expected)) {
  const item = items.find((row) => row.id === id);
  assert.ok(item, id);
  for (const keyword of keywords) assert.ok(JSON.stringify(item).includes(keyword), id + ": " + keyword);
}
assert.equal(items.filter((row) => row.status === "insufficient").length, 3);
assert.equal(items.filter((row) => row.status === "withheld").length, 1);
assert.ok(items.filter((row) => ["insufficient", "withheld"].includes(row.status)).every((row) => row.providers.length === 0));
assert.equal(items.find((row) => row.id === "acne-hair-removal").providers[0].clinic, null);
assert.equal(items.find((row) => row.id === "nose").providers.length, 3);
assert.equal(recommendations.getClinicRecommendations(" 김창식 ").length, 3);
assert.equal(recommendations.getClinicRecommendations("써마지").length, 2);
assert.equal(recommendations.getClinicRecommendations("김창식 흉터").length, 1);
assert.equal(recommendations.getClinicRecommendations("가상의 없는 병원").length, 0);
assert.equal(recommendations.getClinicRecommendations("", "body").length, 2);
assert.ok(!recommendations.getClinicRecommendationsForQuestion("코스 추천").some((item) => item.id === "nose"));
assert.ok(!recommendations.getClinicRecommendationsForQuestion("눈썹문신").some((item) => item.id === "eyes"));
assert.ok(recommendations.getClinicRecommendationsForQuestion("코 수술").some((item) => item.id === "nose"));
assert.ok(recommendations.findClinicRecommendationText("프로파운드").includes("미확인"));

const { safeReturnPath, approvedPartner, positivePrice } = require(path.join(root, "lib/견적권한.ts"));
for (const value of ["https://evil.test", "//evil.test", "/\\evil.test", "/auth/callback", "/\nother"]) assert.equal(safeReturnPath(value), "/");
assert.equal(safeReturnPath("/request?x=1"), "/request?x=1");
assert.equal(approvedPartner({ tangle_approved: true, tangle_role: "clinic" }), true);
assert.equal(approvedPartner({ tangle_approved: false, tangle_role: "clinic" }), false);
assert.equal(approvedPartner({ role: "admin" }), false);
for (const value of [true, null, "", " ", Infinity, -1]) assert.equal(positivePrice(value), null);

const request = (body) => new Request("http://localhost/api/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const route = (name) => require(path.join(root, "app/api", name, "route.ts"));
const recommendation = route("recommend-course").POST;
let successCount = 0, noResultCount = 0;
for (const concern of ["탄력/리프팅", "주름/노화", "피부결·모공", "톤업/색소", "여드름·흉터", "회복/항노화", "바디라인"]) {
 for (const budget of [50, 80, 120, 180, 250]) {
  for (const downtime of ["low", "medium", "high"]) {
   const response = await recommendation(request({ concern, budget, downtime, age: "30대", goal: "자연스럽게 정리" }));
   const body = await response.json();
   if (response.status === 422) { noResultCount++; continue; }
   assert.equal(response.status, 200, JSON.stringify(body));
   assert.ok(body.items.length >= 1 && body.items.length <= 3);
   assert.ok(body.totalPriceRange.max <= budget);
   assert.ok(body.totalPriceRange.min <= body.totalPrice);
   assert.ok(body.totalPrice <= body.totalPriceRange.max);
   assert.equal(body.explanationSource, "catalog");
   assert.equal(new Set(body.items.map((item) => item.name)).size, body.items.length);
   assert.ok(Math.abs(body.items.reduce((sum, item) => sum + item.priceMax, 0) - body.totalPriceRange.max) < 0.001);
   successCount++;
  }
 }
}
for (const budget of [true, null, {}, "", "Infinity", -1, 10001]) {
 const response = await recommendation(request({ concern: "탄력/리프팅", budget, downtime: "low", age: "30대", goal: "자연스럽게 정리" }));
 assert.equal(response.status, 400);
}
const chat = route("chat").POST;
assert.equal((await chat(request({ message: "" }))).status, 400);
assert.equal((await chat(request({ message: "a".repeat(18000) }))).status, 413);
for (const [query, expectedText] of [["리쥬란 병원", "네스트"], ["써마지 가격", "만원"], ["채선경 원장", "미확인"], ["고우리 병원", "데이터 부족"]]) {
 const response = await chat(request({ message: query }));
 assert.equal(response.status, 200);
 const body = await response.json();
 assert.ok(body.reply.includes(expectedText), query + ": " + body.reply);
 assert.equal(body.aiAvailable, false);
}
const imageRequest = request({ image: "PRIVATE_IMAGE_NOT_TO_BE_READ" });
assert.equal((await route("image-consult").POST(imageRequest)).status, 503);
assert.equal(imageRequest.bodyUsed, false);
assert.equal((await route("my-requests").GET()).status, 503);
assert.equal((await route("partner-requests").GET()).status, 503);
const quoteRequest = new Request("http://localhost/api/requests", { method: "POST", headers: { origin: "http://localhost", "content-type": "application/json" }, body: "{}" });
assert.equal((await route("requests").POST(quoteRequest)).status, 503);
assert.equal((await route("requests").POST(request({}))).status, 403);
const status = await route("quote-status").GET();
assert.deepEqual(await status.json(), { enabled: false });
console.log("서울 25개 분야 원문·검색·정보상태, 인증권한·외부전송 차단 검증 통과");
console.log("추천 105개 조건 검증 통과: 결과 " + successCount + "개, 자료 부족 " + noResultCount + "개");
