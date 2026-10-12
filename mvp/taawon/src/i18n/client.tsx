"use client";
import { createContext, useContext, useMemo } from "react";
import { dictionaries, translate, type Locale, type TFn } from "./config";

const Ctx = createContext<{ locale: Locale; t: TFn }>({
  locale: "ar",
  t: (k) => k,
});

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => {
    const dict = dictionaries[locale];
    return { locale, t: ((key, vars) => translate(dict, key, vars)) as TFn };
  }, [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Client-side translator: `const { t, locale } = useT()` */
export function useT() {
  return useContext(Ctx);
}
