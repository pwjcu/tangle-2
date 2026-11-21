import snapshot from "../data/서울-공개시술가격-2026-11.json";

type PriceKind = "regular" | "event" | "intro" | "conditional";
type Tax = "excluded" | "included" | "exempt" | "unknown";
type Source = {
  clinic: string;
  district: string;
  url: string;
  kind: PriceKind;
  tax: Tax;
  postedOn?: string;
  endsOn?: string;
  terms?: string;
  prices: [name: string, variant: string, won: number][];
};

export const priceKindLabels: Record<PriceKind, string> = {
  regular: "일반가",
  event: "공개 이벤트",
  intro: "1회 체험",
  conditional: "조건부",
};

export const taxLabels: Record<Tax, string> = {
  excluded: "VAT 10% 별도",
  included: "VAT 포함",
  exempt: "VAT 면세",
  unknown: "VAT 표기 없음",
};

export type PublicPrice = Omit<Source, "prices"> & {
  variant: string;
  postedWon: number;
  totalWon: number | null;
};

export type PublicPriceGroup = {
  variant: string;
  kind: PriceKind;
  taxKnown: boolean;
  samples: PublicPrice[];
  minWon: number;
  maxWon: number;
  averageWon: number | null;
  medianWon: number | null;
};

export type PublicPriceSummary = {
  name: string;
  category: string;
  aliases: string[];
  variants: string[];
  preview?: { label: string; price: string };
};

const money = new Intl.NumberFormat("ko-KR");
export const formatWon = (won: number) => `${money.format(won)}원`;
export const publicPriceDate = snapshot.checkedOn;
const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}.]+/gu, "");

type Treatment = Pick<PublicPriceSummary, "name" | "category" | "aliases">;
const treatments: Treatment[] = snapshot.treatments;
const sources = snapshot.sources as Source[];
const rowsByTreatment = new Map<string, PublicPrice[]>();
for (const { prices, ...source } of sources) {
  for (const [name, variant, postedWon] of prices) {
    const totalWon = source.tax === "unknown" ? null : source.tax === "excluded" ? Math.round(postedWon * 1.1) : postedWon;
    const rows = rowsByTreatment.get(name) ?? [];
    rows.push({ ...source, variant, postedWon, totalWon });
    rowsByTreatment.set(name, rows);
  }
}

export const publicPriceSnapshot = {
  clinicCount: new Set(sources.map((source) => source.clinic)).size,
  observationCount: sources.reduce((count, source) => count + source.prices.length, 0),
  treatmentCount: treatments.length,
};

export function getPublicPriceSummaries(): PublicPriceSummary[] {
  return treatments.map((treatment) => {
    const groups = getPublicPriceGroups(treatment.name);
    const preview = groups.filter((group) => group.taxKnown && (group.kind === "regular" || group.kind === "event") && !group.variant.includes("미표기"))
      .sort((a, b) => Number(b.averageWon !== null) - Number(a.averageWon !== null) || b.samples.length - a.samples.length)[0];
    return {
      ...treatment,
      variants: [...new Set(groups.map((group) => group.variant))],
      preview: preview && {
        label: `${preview.variant} · ${priceKindLabels[preview.kind]} · ${preview.samples.length}곳`,
        price: preview.averageWon !== null ? `평균 ${formatWon(preview.averageWon)}` : formatPublicPriceRange(preview),
      },
    };
  });
}

export const getPublicPriceNames = () => treatments.map((treatment) => treatment.name);

export function getPublicPriceTreatment(name: string) {
  const key = normalize(name);
  return treatments.find((treatment) => normalize(treatment.name) === key)
    ?? treatments.find((treatment) => treatment.aliases.some((alias) => normalize(alias) === key));
}

export function formatPublicPriceRange({ minWon, maxWon }: PublicPriceGroup) {
  return minWon === maxWon ? formatWon(minWon) : `${formatWon(minWon)}~${formatWon(maxWon)}`;
}

export function getPublicPriceGroups(name: string): PublicPriceGroup[] {
  const byVariant = new Map<string, Map<string, PublicPrice>>();
  for (const row of rowsByTreatment.get(name) ?? []) {
    const key = JSON.stringify([row.variant, row.kind, row.totalWon !== null]);
    const byClinic = byVariant.get(key) ?? new Map<string, PublicPrice>();
    const previous = byClinic.get(row.clinic);
    if (!previous || (row.postedOn ?? "") > (previous.postedOn ?? "")) byClinic.set(row.clinic, row);
    byVariant.set(key, byClinic);
  }

  return [...byVariant.values()].map((byClinic) => {
    const samples = [...byClinic.values()].sort((a, b) => (a.totalWon ?? a.postedWon) - (b.totalWon ?? b.postedWon));
    const first = samples[0];
    const prices = samples.map((row) => row.totalWon ?? row.postedWon);
    const middle = Math.floor(prices.length / 2);
    const canSummarize = prices.length >= 3 && first.totalWon !== null
      && (first.kind === "regular" || first.kind === "event") && !first.variant.includes("미표기");
    return {
      variant: first.variant,
      kind: first.kind,
      taxKnown: first.totalWon !== null,
      samples,
      minWon: prices[0],
      maxWon: prices.at(-1)!,
      averageWon: canSummarize ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) : null,
      medianWon: canSummarize ? (prices.length % 2 ? prices[middle] : Math.round((prices[middle - 1] + prices[middle]) / 2)) : null,
    };
  }).sort((a, b) => a.variant.localeCompare(b.variant, "ko", { numeric: true })
    || Number(b.taxKnown) - Number(a.taxKnown)
    || Object.keys(priceKindLabels).indexOf(a.kind) - Object.keys(priceKindLabels).indexOf(b.kind));
}

function matchingTreatments(question: string) {
  const query = normalize(question);
  const matches = treatments.flatMap((treatment) => {
    const match = [treatment.name, ...treatment.aliases].map(normalize)
      .filter((name) => name.length > 1 && query.includes(name))
      .sort((a, b) => b.length - a.length)[0];
    return match ? [{ treatment, match }] : [];
  }).sort((a, b) => b.match.length - a.match.length);
  return matches.filter(({ match }, index) => !matches.slice(0, index).some((other) => other.match.includes(match)))
    .map(({ treatment }) => treatment);
}

function variantNumbers(text: string): string[] {
  return [...text.toLowerCase().matchAll(/(\d+(?:\.\d+)?)\s*(샷|cc|kj|만줄|유닛|unit|u\b|회|펄스|vial|바이알|시린지|병|부위)/gu)]
    .map(([, value, unit]) => `${unit === "만줄" ? Number(value) * 10 : Number(value)}${({ 만줄: "kj", 유닛: "u", unit: "u", vial: "바이알" } as Record<string, string>)[unit] ?? unit}`);
}

const variantLabels: Record<string, string[]> = {
  리쥬란: ["힐러", "HB Plus", "HB", "아이", "S"],
  덴서티: ["클래식", "알파", "하이", "아이"],
  인모드: ["FX", "포르마"],
};

function requestedLabels(name: string, question: string) {
  const key = normalize(question);
  return (variantLabels[name] ?? []).filter((label) => {
    const term = normalize(label);
    if (term === "s") return /(?:리쥬란\s*s|\bs\b)/iu.test(question);
    if (term === "hb" && key.includes("hbplus")) return false;
    return key.includes(term);
  });
}

export function findPublicPriceAnswer(question: string) {
  if (!/가격|얼마|비용|견적|price|cost|値段|料金|价格|费用|ราคา/iu.test(question)) return "";
  const matches = matchingTreatments(question).slice(0, 3);
  if (!matches.length) return "";
  const requested = variantNumbers(question);
  const results = matches.map(({ name }) => {
    const labels = requestedLabels(name, question);
    const groups = getPublicPriceGroups(name);
    const best = groups.filter(({ variant, taxKnown }) => taxKnown
      && requested.every((unit) => variantNumbers(variant).includes(unit))
      && labels.every((label) => normalize(variant).includes(normalize(label))));
    const ranked = [...best].sort((a, b) => Number(b.averageWon !== null) - Number(a.averageWon !== null)
      || b.samples.length - a.samples.length);
    const rows = ranked.slice(0, matches.length > 1 ? 2 : 4).map((group) => {
      const average = group.averageWon === null ? "" : ` · 평균 ${formatWon(group.averageWon)}`;
      return `- ${group.variant} · ${priceKindLabels[group.kind]} · ${formatPublicPriceRange(group)}${average} · ${group.samples.length}곳`;
    });
    return [
      name,
      ...(rows.length ? rows : ["질문의 규격과 세금 조건을 함께 확인할 수 있는 가격 표본이 없습니다."]),
      `/prices/${encodeURIComponent(name)}`,
    ].join("\n");
  });
  return [
    `서울 병원 공개 자료 · ${publicPriceDate} 확인 · 세금을 반영한 비교가`,
    ...results,
    "체험·이벤트 조건과 종료일은 원문에서 확인해 주세요.",
  ].join("\n\n");
}
