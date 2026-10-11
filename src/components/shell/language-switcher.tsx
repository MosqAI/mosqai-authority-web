"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dictionaries, LOCALES } from "@/i18n/config";
import { useI18n, useSetLocale } from "@/i18n/client";

/** Globe button with EN / FR / RW menu. */
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const { change, pending } = useSetLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.common.language}
        className="glass-strong flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
      >
        <Globe className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
        {locale.toUpperCase()}
      </button>
      {open && (
        <ul role="menu" className="glass absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl! p-1.5">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === locale}
                onClick={() => {
                  setOpen(false);
                  if (l !== locale) change(l);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-ink transition hover:bg-accent-soft/60"
              >
                {dictionaries[l].meta.languageName}
                {l === locale && <Check className="size-4 text-accent" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
