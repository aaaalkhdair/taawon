import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dictionaries, translate, type Locale, type TFn } from "./config";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return v === "en" || v === "ar" ? v : DEFAULT_LOCALE;
}

/** Server-side translator: `const { t, locale } = await getT()` */
export async function getT(): Promise<{ t: TFn; locale: Locale; dir: "rtl" | "ltr" }> {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    t: (key, vars) => translate(dict, key, vars),
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
  };
}
