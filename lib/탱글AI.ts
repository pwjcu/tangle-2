import OpenAI from "openai";
import { rateLimited } from "./호출제한";

/**
 * 탱글 AI 공통 호출.
 * - OPENAI_API_KEY가 있고 TANGLE_AI가 "off"가 아닐 때만 외부 AI를 씁니다.
 * - 크레딧 부족·시간 초과·오류가 나면 null을 돌려주고, 각 기능은 탱글 자체 로직으로 답합니다.
 * - 입력 내용은 저장하지 않습니다.
 */
export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

export function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY) && process.env.TANGLE_AI !== "off";
}

let client: OpenAI | null = null;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 25_000, maxRetries: 0 });
  return client;
}

/** AI 기능 호출 제한(IP당 1분 12회). */
export function aiRateLimited(req: Request, limit = 12, windowMs = 60_000) {
  return rateLimited(req, "ai", limit, windowMs);
}

type AskOptions = { system: string; user: string; json?: boolean; maxTokens?: number; imageDataUrl?: string };

/** AI 답변 문자열을 돌려주거나, 쓸 수 없으면 null. */
export async function askAI({ system, user, json = false, maxTokens = 900, imageDataUrl }: AskOptions): Promise<string | null> {
  if (!aiEnabled()) return null;
  try {
    const response = await getClient().chat.completions.create({
      model: AI_MODEL,
      reasoning_effort: "low",
      max_completion_tokens: maxTokens + 600,
      ...(json ? { response_format: { type: "json_object" as const } } : {}),
      messages: [
        { role: "system", content: system },
        imageDataUrl
          ? { role: "user", content: [{ type: "text", text: user }, { type: "image_url", image_url: { url: imageDataUrl, detail: "low" } }] }
          : { role: "user", content: user },
      ],
    });
    const text = response.choices[0]?.message?.content?.trim();
    return text || null;
  } catch (error) {
    const status = (error as { status?: number }).status;
    console.warn("[탱글AI] 호출 실패", status ?? (error as Error).message);
    return null;
  }
}

/** JSON 응답을 파싱합니다. 실패하면 null. */
export async function askAIJson<T>(options: Omit<AskOptions, "json">): Promise<T | null> {
  const text = await askAI({ ...options, json: true });
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const languageNames = { ko: "Korean", en: "English", zh: "Simplified Chinese", ja: "Japanese", th: "Thai" } as const;

/** 탱글 AI 공통 원칙. */
export const TANGLE_AI_RULES = `You are Tangle AI, the assistant of tangle.kr — a free, ad-free information hub that helps people check clinics and treatment prices before booking or consultation in Korea.
Rules:
- Use ONLY the facts in the provided Tangle reference data. If something is not in the data, say it is not in Tangle's records. Never invent clinics, doctors, prices, or outcomes.
- You are not a doctor. Do not diagnose or promise results. For medical decisions, tell the user to confirm in a consultation.
- No advertising tone. Be concise, warm, and practical.`;
