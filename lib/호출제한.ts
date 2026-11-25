/** 서버 인스턴스 단위의 간단한 호출 제한. 키(기능 이름)별로 IP당 횟수를 셉니다. */
const hits = new Map<string, number[]>();

export function rateLimited(req: Request, key: string, limit: number, windowMs = 60_000) {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > limit;
}
