import { cookies } from "next/headers";
import { DEFAULT_LOCALE, dictionaries, formatters, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Dictionary + formatters for the current request, for server components. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale], f: formatters(locale) };
}
