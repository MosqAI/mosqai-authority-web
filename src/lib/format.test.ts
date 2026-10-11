import { describe, expect, it } from "vitest";
import { dictionaries, fmt, formatters, LOCALES } from "@/i18n/config";
import { formatChange } from "./format";

describe("formatChange", () => {
  it("rounds whole percentages and keeps the sign", () => {
    expect(formatChange(0.16)).toBe("+16%");
    expect(formatChange(-0.04)).toBe("-4%");
  });

  it("keeps one decimal for sub-percent changes", () => {
    expect(formatChange(0.001)).toBe("+0.1%");
  });
});

describe("formatters", () => {
  it("formats dates in Kigali time regardless of the host zone", () => {
    // 23:30 UTC is already the next day in Kigali (UTC+2).
    expect(formatters("en").date("2026-09-28T23:30:00Z")).toBe("Sep 29, 2026");
    expect(formatters("fr").date("2026-09-28T23:30:00Z")).toBe("29 sept. 2026");
    expect(formatters("rw").date("2026-09-28T23:30:00Z")).toBe("29 Nzeri 2026");
    expect(formatters("rw").number(12842.5)).toBe("12.842,5");
  });

  it("formats relative time per language", () => {
    const now = Date.parse("2026-09-29T12:00:00Z");
    expect(formatters("en").ago("2026-09-29T10:00:00Z", now)).toBe("2 hours ago");
    expect(formatters("fr").ago("2026-09-29T10:00:00Z", now)).toBe("il y a 2 heures");
    expect(formatters("rw").ago("2026-09-29T10:00:00Z", now)).toBe("hashize amasaha 2");
  });
});

describe("dictionaries", () => {
  const leaves = (o: unknown, path = ""): [string, string][] =>
    typeof o === "string"
      ? [[path, o]]
      : Object.entries(o as object).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));

  it("use the same {placeholders} as English in every language", () => {
    const en = new Map(leaves(dictionaries.en));
    for (const locale of LOCALES) {
      for (const [path, text] of leaves(dictionaries[locale])) {
        const names = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
        expect(names(text), `${locale}:${path}`).toEqual(names(en.get(path)!));
      }
    }
  });

  it("fills placeholders", () => {
    expect(fmt("Hi {name}, {n} new", { name: "Ada", n: 3 })).toBe("Hi Ada, 3 new");
  });
});
