import en, { type Dict } from "./dictionaries/en";
import fr from "./dictionaries/fr";
import rw from "./dictionaries/rw";

export const LOCALES = ["en", "fr", "rw"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "mosqai-lang";

export const dictionaries: Record<Locale, Dict> = { en, fr, rw };

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

/** Fills {placeholders}: fmt("Hi {name}", { name: "Ada" }). */
export function fmt(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

// Pin the zone so server and client render identical strings (no hydration drift).
const TZ = "Africa/Kigali";
const intlLocale = { en: "en-US", fr: "fr-FR" } as const;

// Browsers ship no Kinyarwanda locale data (Chrome falls back to English while
// Node formats "rw"), so Kinyarwanda is formatted by hand to match on both sides.
const RW_MONTHS = ["Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena", "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza"];
const RW_DAYS = ["Cyumweru", "Kuwa mbere", "Kuwa kabiri", "Kuwa gatatu", "Kuwa kane", "Kuwa gatanu", "Kuwa gatandatu"];
const RW_DAYS_NARROW = ["C", "M", "K", "G", "K", "G", "G"];
const kigaliParts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "numeric", day: "numeric", weekday: "short", timeZone: TZ });
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function rwParts(d: Date) {
  const p = Object.fromEntries(kigaliParts.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: Number(p.day), month: Number(p.month) - 1, year: Number(p.year), weekday: WEEKDAY_INDEX[p.weekday] };
}

function rwAgo(minutesAgo: number) {
  const unit = (n: number, one: string, many: string) => `hashize ${n === 1 ? one : many} ${n}`;
  if (minutesAgo < 1) return "nonaha";
  if (minutesAgo < 60) return unit(minutesAgo, "umunota", "iminota");
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return unit(hours, "isaha", "amasaha");
  return unit(Math.round(hours / 24), "umunsi", "iminsi");
}

/** Locale-aware formatters, shared by server pages and client components. */
export function formatters(locale: Locale) {
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

  if (locale === "rw") {
    const en = new Intl.NumberFormat("en-US");
    const date = (d: Date) => {
      const p = rwParts(d);
      return `${p.day} ${RW_MONTHS[p.month]} ${p.year}`;
    };
    return {
      date: (iso: string) => date(new Date(iso)),
      shortDate: (iso: string) => {
        const p = rwParts(new Date(iso));
        return `${p.day} ${RW_MONTHS[p.month].slice(0, 3)}`;
      },
      longDate: (d: Date) => `${RW_DAYS[rwParts(d).weekday]}, ${date(d)}`,
      month: (d: Date) => {
        const p = rwParts(d);
        return `${RW_MONTHS[p.month]} ${p.year}`;
      },
      weekday: (d: Date) => RW_DAYS_NARROW[rwParts(d).weekday],
      time: (iso: string) => time.format(new Date(iso)),
      dateTime: (iso: string) => `${date(new Date(iso))} • ${time.format(new Date(iso))}`,
      // CLDR rw groups with "." and uses "," for decimals.
      number: (n: number) => en.format(n).replace(/[,.]/g, (c) => (c === "," ? "." : ",")),
      ago: (iso: string, now = Date.now()) => rwAgo(Math.round((now - new Date(iso).getTime()) / 60000)),
    };
  }

  const tag = intlLocale[locale];
  const date = new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", year: "numeric", timeZone: TZ });
  const short = new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", timeZone: TZ });
  const long = new Intl.DateTimeFormat(tag, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: TZ });
  const month = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: TZ });
  const weekday = new Intl.DateTimeFormat(tag, { weekday: "narrow", timeZone: TZ });
  const number = new Intl.NumberFormat(tag);
  const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  return {
    date: (iso: string) => date.format(new Date(iso)),
    shortDate: (iso: string) => short.format(new Date(iso)),
    longDate: (d: Date) => long.format(d),
    month: (d: Date) => month.format(d),
    weekday: (d: Date) => weekday.format(d),
    time: (iso: string) => time.format(new Date(iso)),
    dateTime: (iso: string) => `${date.format(new Date(iso))} • ${time.format(new Date(iso))}`,
    number: (n: number) => number.format(n),
    ago: (iso: string, now = Date.now()) => {
      const minutes = Math.round((new Date(iso).getTime() - now) / 60000);
      if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
      const hours = Math.round(minutes / 60);
      if (Math.abs(hours) < 24) return relative.format(hours, "hour");
      return relative.format(Math.round(hours / 24), "day");
    },
  };
}

export type Formatters = ReturnType<typeof formatters>;
