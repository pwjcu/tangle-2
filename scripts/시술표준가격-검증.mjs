import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(path.join(root, "data/시술-표준가격-2026-10.json"), "utf8"));
const { metadata, treatments } = dataset;

assert.equal(metadata.imported_at, "2026-10-21");
assert.equal(metadata.source_type, "user_supplied_summary");
assert.equal(metadata.verification_status, "unverified_summary");
assert.equal(metadata.claimed_image_count, 75);
assert.equal(metadata.source_images_provided_for_this_import, 0);
assert.equal(metadata.raw_observation_count, 0);
assert.equal(metadata.image_evidence_linked, false);
assert.equal(metadata.source_bullet_count, 68);
assert.equal(treatments.length, 78);
assert.equal(metadata.normalized_option_count, treatments.length);
assert.equal(new Set(treatments.map((row) => row.id)).size, treatments.length, "ID 중복");
assert.equal(new Set(treatments.map((row) => row.treatment_name)).size, metadata.treatment_family_count);

const validKinds = new Set(["single", "package", "combination", "unlimited"]);
const seenOptions = new Set();
const aliasFamilies = new Map();
const normalize = (name) => name.normalize("NFKC").replace(/\s+/g, "").toLowerCase();
for (const row of treatments) {
  assert.ok(row.treatment_name && row.variant && row.category && row.id);
  assert.ok(Array.isArray(row.aliases));
  assert.ok(validKinds.has(row.kind), `${row.id}: 상품 구분 오류`);
  assert.ok(Number.isFinite(row.min_price_manwon) && row.min_price_manwon >= 0);
  assert.ok(Number.isFinite(row.max_price_manwon) && row.min_price_manwon <= row.max_price_manwon);
  assert.ok(row.average_price_manwon === null || (
    Number.isFinite(row.average_price_manwon)
    && row.average_price_manwon >= row.min_price_manwon
    && row.average_price_manwon <= row.max_price_manwon
  ), `${row.id}: 평균 범위 오류`);
  assert.ok(row.note?.includes("원문 표준 규격:"), `${row.id}: 원문 규격 기록 누락`);
  assert.ok(row.session_count === null || Number.isInteger(row.session_count) && row.session_count > 0);
  if (row.kind === "unlimited") assert.equal(row.session_count, null);
  if (row.kind === "package") assert.equal(row.session_count, 5);
  const key = `${row.treatment_name}|${row.variant}|${row.kind}`;
  assert.ok(!seenOptions.has(key), `${key}: 옵션 중복`);
  seenOptions.add(key);
  for (const name of [row.treatment_name, ...row.aliases]) {
    const normalized = normalize(name);
    const family = aliasFamilies.get(normalized);
    assert.ok(!family || family === row.treatment_name, `${name}: 별칭이 서로 다른 시술군을 연결함`);
    aliasFamilies.set(normalized, row.treatment_name);
  }
  for (const sourceUrl of row.source_urls) {
    const parsed = new URL(sourceUrl);
    assert.equal(parsed.protocol, "https:");
    assert.notEqual(parsed.hostname, "www.google.com", `${row.id}: Google 중계 URL이 남아 있음`);
  }
}

// 실제 조회 모듈을 실행하여 공백·별칭 처리와 서로 다른 시술군의 분리를 검증합니다.
const modulePath = path.join(root, "lib/시술표준가격.ts");
const compiled = ts.transpileModule(readFileSync(modulePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
});
const moduleExports = {};
new Function("require", "exports", compiled.outputText)(createRequire(modulePath), moduleExports);
const family = moduleExports.getStandardPricesForTreatment;
assert.equal(moduleExports.getStandardPriceTreatmentNames().length, 51);
assert.equal(moduleExports.standardTreatmentPrices.length, treatments.length);
assert.equal(moduleExports.standardPriceMeta.verification_status, "unverified_summary");
assert.deepEqual(family("울쎄라").map((row) => row.variant), ["100샷", "300샷", "400샷", "600샷"]);
assert.equal(family("울쎄라피프라임").length, 4);
assert.equal(family("  울쎄라피 프라임  ").length, 4);
assert.equal(family("써마지").length, 2);
assert.equal(family("아이 써마지").length, 1);
assert.ok(family("써마지").every((row) => !row.treatment_name.includes("아이")));
assert.ok(family("리쥬란").every((row) => row.treatment_name === "리쥬란 힐러"));
assert.ok(family("쥬베룩").every((row) => row.treatment_name === "쥬베룩 스킨"));
assert.ok(family("리투오 ECM 스킨부스터").every((row) => row.treatment_name === "리투오"));
assert.equal(family("울쎄라 100샷").length, 0, "부분 문자열 일치를 허용하면 안 됨");
assert.equal(family("").length, 0);
assert.equal(family("스킨부스터").length, 0, "포괄 범주를 개별 시술 별칭으로 사용하면 안 됨");
assert.equal(family("벨로테로 리바이브")[0].average_price_manwon, 35);
assert.equal(family("벨로테로 리바이브")[1].average_price_manwon, 74);
assert.equal(family("포텐자")[0].variant, "모공·나비존 단독 1회, 팁 포함");
assert.ok(family("포텐자")[0].note.includes("얼굴 전체 가격으로 확장하지 않음"));
assert.equal(family("슈링크")[1].variant, "500~600샷");
assert.equal(family("온다")[1].variant, "대용량·바디 80~100KJ");
assert.equal(family("피코토닝").find((row) => row.kind === "package").average_price_manwon, 48);
assert.equal(family("피코토닝").find((row) => row.kind === "package").min_price_manwon, 35);
assert.equal(family("수염 제모").find((row) => row.kind === "unlimited").min_price_manwon, 40);
assert.ok(family("수염 제모").every((row) => row.average_price_manwon === null));
assert.ok(family("필러").every((row) => row.average_price_manwon === null));
assert.ok(family("주름 보톡스").every((row) => row.average_price_manwon === null));
assert.equal(treatments.filter((row) => row.average_price_manwon === null).length, 16);

// 목적지 URL에 남아 있어야 할 쿼리 인코딩을 두 번 해제하지 않았는지 확인합니다.
const ultheraUrl = family("울쎄라")[0].source_urls[0];
assert.ok(ultheraUrl.startsWith("https://www.modoodoc.com/blog/price-detail?tc=%EB%"));
assert.ok(ultheraUrl.includes("&sub_tc=%EC%"));
assert.ok(!ultheraUrl.includes("%25EB"));

console.log(`시술 표준가격 검증 통과: ${treatments.length}개 옵션, ${metadata.treatment_family_count}개 시술군, 본문 68개 가격 항목, 평균 미기재 16개`);
