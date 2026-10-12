import { common } from "./messages/common";
import { admin } from "./messages/admin";
import { specialist } from "./messages/specialist";
import { parent } from "./messages/parent";
import { landing } from "./messages/landing";

export type Locale = "ar" | "en";
export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "locale";

export type Dict = Record<string, string>;

const bundles = [common, admin, specialist, parent, landing];

export const dictionaries: Record<Locale, Dict> = {
  ar: Object.assign({}, ...bundles.map((b) => b.ar)),
  en: Object.assign({}, ...bundles.map((b) => b.en)),
};

/** Translate with optional {placeholder} interpolation. Falls back to the key. */
export function translate(dict: Dict, key: string, vars?: Record<string, string | number>) {
  let s = dict[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string;
