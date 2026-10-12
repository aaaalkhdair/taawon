/**
 * Privacy layer: replaces personal identifiers with neutral tokens before text is sent
 * to the AI provider, and restores them in the response (inside our platform only).
 */
export type Identity = { value: string; token: string };

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?\d[\d\s-]{7,}\d)/g;

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createAnonymizer(identities: Identity[]) {
  // Also register each name part (first name alone) so "أحمد" is masked when the full name is "أحمد خالد".
  const expanded: Identity[] = [];
  for (const id of identities) {
    const v = id.value.trim();
    if (!v) continue;
    expanded.push({ value: v, token: id.token });
    const first = v.split(/\s+/)[0];
    if (first && first.length >= 3 && first !== v) expanded.push({ value: first, token: id.token });
  }
  // longest first so full names win over first names
  expanded.sort((a, b) => b.value.length - a.value.length);

  function mask(text: string): string {
    let out = text.replace(EMAIL, "[email]").replace(PHONE, "[phone]");
    for (const { value, token } of expanded) {
      out = out.replace(new RegExp(escapeRe(value), "g"), token);
    }
    return out;
  }

  function unmask(text: string): string {
    let out = text;
    // restore to the *first* name for natural reading (e.g. "[CHILD]" -> "سارة")
    const seen = new Set<string>();
    for (const id of identities) {
      if (seen.has(id.token)) continue;
      seen.add(id.token);
      const display = id.value.trim().split(/\s+/)[0] || id.value;
      out = out.replace(new RegExp(escapeRe(id.token), "g"), display);
    }
    return out;
  }

  /** Deep-unmask any JSON-like value. */
  function unmaskDeep<T>(value: T): T {
    if (typeof value === "string") return unmask(value) as T;
    if (Array.isArray(value)) return value.map(unmaskDeep) as T;
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, unmaskDeep(v)])) as T;
    }
    return value;
  }

  return { mask, unmask, unmaskDeep };
}
