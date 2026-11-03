import { createClient } from "@supabase/supabase-js";
import { mergeLocalTreatments } from "./localTreatments";

export interface ConsultTreatment {
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  description: string;
  synergy: string | null;
  side_effects: string | null;
  recovery: string | null;
  cycle: string | null;
  recommended_for: string | null;
}

function isTreatment(value: unknown): value is ConsultTreatment {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ConsultTreatment>;
  return typeof row.name === "string" && !!row.name.trim() && typeof row.category === "string"
    && typeof row.description === "string" && typeof row.price_min === "number"
    && Number.isFinite(row.price_min) && row.price_min >= 0 && typeof row.price_max === "number"
    && Number.isFinite(row.price_max) && row.price_max >= row.price_min;
}

/** Configuration absence or a read failure must not break public consultation pages. */
export async function loadConsultTreatments(): Promise<ConsultTreatment[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let remote: ConsultTreatment[] = [];
  if (url && key) {
    try {
      const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await client.from("treatments")
        .select("name, category, price_min, price_max, description, synergy, side_effects, recovery, cycle, recommended_for")
        .limit(500)
        .abortSignal(AbortSignal.timeout(5_000));
      if (!error && Array.isArray(data)) remote = data.filter(isTreatment);
    } catch {
      // Never log request contents, photos, credentials, or provider error bodies.
    }
  }
  return mergeLocalTreatments(remote).filter(isTreatment);
}
