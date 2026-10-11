"use client";

import { Check, MapPin, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Badge, severityTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useI18n } from "@/i18n/client";
import type { Alert } from "@/lib/types";
import { AlertIcon } from "./alert-icon";

type Filter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

// The design groups informational alerts under "Low".
const matches = (a: Alert, f: Filter) => f === "ALL" || a.severity === f || (f === "LOW" && a.severity === "INFO");

const FILTERS: { id: Filter; dot?: string }[] = [
  { id: "ALL" },
  { id: "HIGH", dot: "bg-rose-500" },
  { id: "MEDIUM", dot: "bg-amber-500" },
  { id: "LOW", dot: "bg-emerald-500" },
];

export function AlertsList({ alerts: initial }: { alerts: Alert[] }) {
  const { t, f } = useI18n();
  // Local state until the backend's acknowledge/dismiss endpoints are wired in.
  const [alerts, setAlerts] = useState(initial);
  const [filter, setFilter] = useState<Filter>("ALL");

  const open = alerts.filter((a) => !a.acknowledged);
  const visible = alerts.filter((a) => matches(a, filter));
  const acknowledge = (id: string) => setAlerts((all) => all.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  const dismiss = (id: string) => setAlerts((all) => all.filter((a) => a.id !== id));

  return (
    <>
      <PageHeader
        title={t.alerts.title}
        description={t.alerts.description}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setAlerts((all) => all.map((a) => ({ ...a, acknowledged: true })))}
              disabled={open.length === 0}
            >
              <Check className="size-4" aria-hidden /> {t.alerts.markAllRead}
            </Button>
            <Button variant="dark" title={t.common.needsBackend} disabled>
              <SlidersHorizontal className="size-4" aria-hidden /> {t.alerts.configureRules}
            </Button>
          </>
        }
      />

      <div role="tablist" aria-label={t.alerts.severity} className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, dot }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                active ? "bg-accent text-white" : "glass-strong text-ink-soft hover:text-ink"
              }`}
            >
              {dot && <span className={`size-2 rounded-full ${dot}`} />}
              {id === "ALL" ? t.common.all : t.enums.severity[id]} ({alerts.filter((a) => matches(a, id)).length})
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((alert) => (
          <li key={alert.id}>
            <Card className={`flex flex-wrap items-center justify-between gap-4 p-5 ${alert.acknowledged ? "opacity-60" : ""}`}>
              <div className="flex min-w-0 gap-4">
                <AlertIcon alert={alert} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">{alert.title}</h2>
                    <Badge tone={severityTone[alert.severity]}>{t.enums.severity[alert.severity]}</Badge>
                    {alert.acknowledged && <Badge tone="neutral">{t.alerts.acknowledged}</Badge>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                    <span className="font-semibold text-ink-soft">{alert.location}</span>
                    <span className="text-ink-faint">•</span>
                    <span className="text-ink-soft">{alert.message}</span>
                    <span className="text-ink-faint">•</span>
                    {/* Relative time legitimately differs between prerender and the browser. */}
                    <span className="text-ink-faint" suppressHydrationWarning>
                      {f.ago(alert.createdAt)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {alert.kind === "DEVICE_OFFLINE" && alert.deviceId ? (
                  <ButtonLink variant="soft" href={`/devices/${alert.deviceId}`}>
                    {t.alerts.investigate}
                  </ButtonLink>
                ) : (
                  !alert.acknowledged &&
                  alert.severity !== "LOW" &&
                  alert.severity !== "INFO" && (
                    <Button variant="soft" onClick={() => acknowledge(alert.id)}>
                      {t.alerts.acknowledge}
                    </Button>
                  )
                )}
                {alert.severity === "HIGH" && (
                  <ButtonLink variant="secondary" href={alert.deviceId ? `/map?device=${alert.deviceId}` : "/map"}>
                    <MapPin className="size-3.5" aria-hidden /> {t.alerts.viewOnMap}
                  </ButtonLink>
                )}
                {alert.severity !== "HIGH" && (
                  <Button variant="secondary" onClick={() => dismiss(alert.id)}>
                    {t.alerts.dismiss}
                  </Button>
                )}
              </div>
            </Card>
          </li>
        ))}
        {visible.length === 0 && <li className="py-12 text-center text-sm text-ink-soft">{t.alerts.empty}</li>}
      </ul>
    </>
  );
}
