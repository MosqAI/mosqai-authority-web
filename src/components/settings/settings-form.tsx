"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/fields";
import { dictionaries, LOCALES } from "@/i18n/config";
import type { SessionUser } from "@/lib/session";
import { useI18n, useSetLocale } from "@/i18n/client";

const FLAGS = { en: "EN", fr: "FR", rw: "RW" } as const;
const PREF_KEYS = ["highRisk", "offline", "weekly"] as const;

export function SettingsForm({ user }: { user: SessionUser }) {
  const { t, locale } = useI18n();
  const { change, pending } = useSetLocale();
  // Stored locally until a preferences endpoint exists.
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ highRisk: true, offline: true, weekly: false });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-6 lg:col-span-2">
        <h2 className="text-base font-semibold text-ink">{t.settings.languageTitle}</h2>
        <p className="mt-1 text-xs text-ink-soft/80">{t.settings.languageHint}</p>
        <div role="radiogroup" aria-label={t.settings.languageTitle} className="mt-4 grid gap-3 sm:grid-cols-3">
          {LOCALES.map((l) => {
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={pending}
                onClick={() => !active && change(l)}
                className={`flex items-center gap-3 rounded-lg p-4 text-left transition ${
                  active ? "bg-white ring-2 ring-accent" : "glass-strong hover:bg-white"
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "bg-accent text-white" : "bg-slate-200/70 text-ink-soft"
                  }`}
                >
                  {FLAGS[l]}
                </span>
                <span className="flex-1 text-sm font-semibold text-ink">{dictionaries[l].meta.languageName}</span>
                {active && <Check className="size-4 text-accent" aria-hidden />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink">{t.settings.organisation}</h2>
        <dl className="mt-3 divide-y divide-white/70 text-sm">
          {[
            [t.settings.authority, t.nav.org],
            [t.settings.signedInAs, user.name],
            [t.settings.role, t.enums.role[user.role]],
            [t.settings.timeZone, "Africa/Kigali (CAT)"],
          ].map(([term, value]) => (
            <div key={term} className="flex justify-between gap-4 py-3">
              <dt className="text-ink-soft">{term}</dt>
              <dd className="text-right font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink">{t.settings.notifications}</h2>
        <ul className="mt-3 divide-y divide-white/70">
          {PREF_KEYS.map((id) => {
            const [label, hint] = t.settings.prefs[id];
            return (
              <li key={id} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm font-medium text-ink">{label}</span>
                  <span className="block text-xs text-ink-soft">{hint}</span>
                </span>
                <Toggle label={label} checked={prefs[id]} onChange={(v) => setPrefs((p) => ({ ...p, [id]: v }))} />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
