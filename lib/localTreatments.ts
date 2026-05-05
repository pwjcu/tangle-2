import reviewedTreatments from "../data/korea-skin-procedures-2026-reviewed.json";

export interface LocalTreatment {
  id: string;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
  side_effects: string;
  recovery: string;
  cycle: string;
  recommended_for: string;
  isLocalSeed: true;
}

interface ReviewedTreatment {
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  side_effects: string;
  recovery: string;
  recommended_for: string;
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export const localTreatments: LocalTreatment[] = (reviewedTreatments.included as ReviewedTreatment[]).map(
  (treatment, index) => ({
    id: `local-${index + 1}`,
    name: treatment.name,
    category: treatment.category,
    price_min: treatment.price_min,
    price_max: treatment.price_max,
    pain_level: treatment.pain_level,
    description: treatment.description,
    synergy: "상담 후 조합 가능",
    side_effects: treatment.side_effects,
    recovery: treatment.recovery,
    cycle: "상담 후 주기 결정",
    recommended_for: treatment.recommended_for,
    isLocalSeed: true,
  }),
);

export function mergeLocalTreatments<T extends { name: string }>(remoteTreatments: T[] | null | undefined) {
  const remote = remoteTreatments ?? [];
  const existingNames = new Set(remote.map((treatment) => normalizeName(treatment.name)));
  const missingLocalTreatments = localTreatments.filter((treatment) => !existingNames.has(normalizeName(treatment.name)));

  return [...remote, ...missingLocalTreatments];
}

export function getLocalTreatmentsByCategory(category: string) {
  return localTreatments.filter((treatment) => treatment.category === category);
}
