import { supportedLanguages, type SupportedLanguage } from "./i18n";

export class ConsultInputError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "ConsultInputError";
  }
}

export function normalizeConsultLanguage(value: unknown): SupportedLanguage {
  return typeof value === "string" && supportedLanguages.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : "ko";
}

/** Limit bytes while reading, including requests without Content-Length. */
export async function readConsultBody(req: Request, maxBytes = 16_384): Promise<Record<string, unknown>> {
  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ConsultInputError("입력 내용이 너무 큽니다.", 413);
  }
  if (!req.body) throw new ConsultInputError("입력 내용이 없습니다.");
  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new ConsultInputError("입력 내용이 너무 큽니다.", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ConsultInputError("올바른 JSON 형식으로 입력해주세요.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ConsultInputError("입력 형식을 확인해주세요.");
  }
  return data as Record<string, unknown>;
}

export function readConsultText(value: unknown, label: string, maxLength = 2_000): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ConsultInputError(`${label}을 입력해주세요.`);
  }
  const result = value.trim();
  if (result.length > maxLength) throw new ConsultInputError(`${label}은 ${maxLength}자 이내로 입력해주세요.`);
  return result;
}

export function readConsultChoice(value: unknown, choices: readonly string[], label: string): string {
  if (typeof value !== "string" || !choices.includes(value)) {
    throw new ConsultInputError(`${label} 선택을 확인해주세요.`);
  }
  return value;
}
