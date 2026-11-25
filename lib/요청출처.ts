/**
 * 다른 사이트의 브라우저가 탱글 API(특히 AI 비용이 드는 API)를 대신 호출하지 못하게 막습니다.
 * Origin 헤더가 있고 탱글 주소와 다르면 거부합니다. (서버 간 호출처럼 Origin이 없으면 호출 제한으로 막습니다.)
 */
export function isCrossSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return origin !== new URL(request.url).origin;
  } catch {
    return true;
  }
}
