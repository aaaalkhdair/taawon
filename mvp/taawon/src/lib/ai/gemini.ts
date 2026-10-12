import "server-only";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null = null;
function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

/** True when a Gemini key is configured. When false, the app uses realistic demo fallbacks. */
export function isAiEnabled() {
  return !!process.env.GEMINI_API_KEY && process.env.AI_DEMO_MODE !== "1";
}

export type ChatTurn = { role: "user" | "model"; text: string };

/** Ask Gemini for structured JSON. Returns null on any failure so callers can fall back. */
export async function generateJson<T>(opts: { system: string; prompt: string; schema: object; temperature?: number }): Promise<T | null> {
  const ai = getClient();
  if (!ai || !isAiEnabled()) return null;
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: opts.prompt,
      config: {
        systemInstruction: opts.system,
        responseMimeType: "application/json",
        responseJsonSchema: opts.schema,
        temperature: opts.temperature ?? 0.6,
      },
    });
    const text = res.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("[gemini] generateJson failed:", err);
    return null;
  }
}

/** Free-text generation (optionally multi-turn). Returns null on failure. */
export async function generateText(opts: { system: string; prompt?: string; history?: ChatTurn[]; temperature?: number }): Promise<string | null> {
  const ai = getClient();
  if (!ai || !isAiEnabled()) return null;
  try {
    const contents = [
      ...(opts.history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      ...(opts.prompt ? [{ role: "user" as const, parts: [{ text: opts.prompt }] }] : []),
    ];
    const res = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: opts.system, temperature: opts.temperature ?? 0.7 },
    });
    return res.text?.trim() || null;
  } catch (err) {
    console.error("[gemini] generateText failed:", err);
    return null;
  }
}
