export function safeReturnPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return fallback;
  try {
    const base = "https://tangle.invalid";
    const parsed = new URL(value, base);
    if (parsed.origin !== base || parsed.pathname.startsWith("/auth/")) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch { return fallback; }
}

// NEW explicit contract: only a trusted administrator may assign these app_metadata keys.
// user_metadata is never an authority.
export function approvedPartner(metadata: Record<string, unknown> | null | undefined) {
  return metadata?.tangle_approved === true &&
    (metadata?.tangle_role === "clinic" || metadata?.tangle_role === "admin");
}

export function positivePrice(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= 100000 ? number : null;
}

export function boundedText(value: unknown, max: number, min = 1) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length >= min && text.length <= max ? text : null;
}
