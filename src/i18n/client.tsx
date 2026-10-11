"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useTransition } from "react";
import { setLocale } from "./actions";
import { dictionaries, formatters, type Locale } from "./config";

const I18nContext = createContext<{ locale: Locale } | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  const { locale } = ctx;
  return useMemo(() => ({ locale, t: dictionaries[locale], f: formatters(locale) }), [locale]);
}

/** Switches language: stores the cookie, then re-renders server components. */
export function useSetLocale() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const change = (locale: Locale) =>
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  return { change, pending };
}
