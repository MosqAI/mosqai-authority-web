import { Bug, Calendar, Camera, Cpu, MapPinned, TrendingUp, Wifi } from "lucide-react";
import { AlertIcon } from "@/components/alerts/alert-icon";
import { ActivityChart } from "@/components/dashboard/charts";
import { FieldSchedule, ScenicCard } from "@/components/dashboard/side-panels";
import { Badge, riskTone } from "@/components/ui/badge";
import { Card, CardHeader, PillLink } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { dailyTotals } from "@/lib/analytics";
import { getAlerts, getAreaDays, getAreas, getDevices, getSummary } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { formatChange } from "@/lib/format";
import type { DeviceType } from "@/lib/types";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.dashboard };
}

const barColor: Record<DeviceType, string> = {
  MOSQUITO_TRAP: "bg-[linear-gradient(90deg,#818cf8,#e26d9f)]",
  CAMERA_TRAP: "bg-[linear-gradient(90deg,#38bdf8,#7c3aed)]",
  WEATHER_SENSOR: "bg-[linear-gradient(90deg,#fbbf24,#fb923c)]",
};
const typeIcon = { MOSQUITO_TRAP: Bug, CAMERA_TRAP: Camera, WEATHER_SENSOR: Wifi } as const;

/** Hour in Kigali, for the greeting. */
const kigaliHour = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Kigali" }).format(d));

export default async function DashboardPage() {
  const { t, f } = await getI18n();
  const [user, summary, areas, alerts, devices, series] = await Promise.all([
    getSessionUser(),
    getSummary(),
    getAreas(),
    getAlerts(),
    getDevices(),
    getAreaDays(),
  ]);

  const now = new Date();
  const hour = kigaliHour(now);
  const greeting = hour < 12 ? t.dashboard.morning : hour < 18 ? t.dashboard.afternoon : t.dashboard.evening;
  const trend = dailyTotals(series, 14);
  const known = trend.filter((d) => d.captures !== null);
  const weekChange =
    known.length >= 14
      ? known.slice(-7).reduce((a, d) => a + d.captures!, 0) / known.slice(0, 7).reduce((a, d) => a + d.captures!, 0) - 1
      : null;

  const activeCount = devices.filter((d) => d.status !== "OFFLINE").length;
  const fleet = (Object.keys(t.enums.deviceType) as DeviceType[]).map((type) => {
    const ofType = devices.filter((d) => d.type === type);
    return { type, total: ofType.length, active: ofType.filter((d) => d.status !== "OFFLINE").length };
  });
  const maxCount = Math.max(...areas.map((a) => a.mosquitoCount));

  return (
    <div className="grid gap-6 px-4 pt-6 pb-10 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {fmt(greeting, { name: user.name.replace(/^Dr.?s+/, "").split(" ")[0] })}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{t.dashboard.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-ink-faint">{f.longDate(now)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-white px-3 py-1.5 text-xs text-ink-soft">
              <Calendar className="size-3.5 text-ink-soft" aria-hidden />
              {t.common.thisWeek}
            </span>
          </div>
        </div>

        <section aria-label="Key indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={t.dashboard.totalMosquitoes}
            value={f.number(summary.totalMosquitoes.value)}
            changeLabel={formatChange(summary.totalMosquitoes.change)}
            change={summary.totalMosquitoes.change}
            higherIsBad
            icon={TrendingUp}
           
          />
          <KpiCard
            label={t.dashboard.highRiskAreas}
            value={String(summary.highRiskAreas.value)}
            changeLabel={formatChange(summary.highRiskAreas.change)}
            change={summary.highRiskAreas.change}
            higherIsBad
            icon={MapPinned}
           
          />
          <KpiCard
            label={t.dashboard.activeDevices}
            value={String(activeCount)}
            suffix={`/ ${devices.length}`}
            changeLabel={formatChange(summary.activeDevices.change)}
            change={summary.activeDevices.change}
            icon={Cpu}
           
          />
          <KpiCard
            label={t.dashboard.captures}
            value={f.number(summary.captures.value)}
            changeLabel={formatChange(summary.captures.change)}
            change={summary.captures.change}
            higherIsBad
            icon={Camera}
           
          />
        </section>

        <Card className="relative min-w-0 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">{t.dashboard.performance}</h2>
              <p className="mt-0.5 text-xs text-ink-faint">
                {t.dashboard.performanceSub}
                {weekChange !== null && (
                  <span className={`ml-2 font-medium ${weekChange > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {formatChange(weekChange)} {t.dashboard.growth}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> {t.dashboard.total}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet" /> {t.analytics.anopheles}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ActivityChart data={trend} />
          </div>
        </Card>

        <div className="grid gap-5 2xl:grid-cols-[1.25fr_1fr]">
          <Card className="min-w-0 p-6">
            <CardHeader title={t.dashboard.topAreas} action={<PillLink href="/analytics">{t.common.seeAll}</PillLink>} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-ink-faint">
                  <tr>
                    <th className="pb-3 font-medium">{t.dashboard.area}</th>
                    <th className="pb-3 font-medium">{t.dashboard.count}</th>
                    <th className="pb-3 text-right font-medium">{t.dashboard.risk}</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.slice(0, 5).map((area) => (
                    <tr key={area.name}>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-3">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lavender text-[10px] font-semibold text-accent-strong"
                          >
                            {area.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span>
                            <span className="block font-semibold text-ink">{area.name}</span>
                            <span className="block text-[11px] text-ink-faint">{area.district}</span>
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200/70">
                            <span
                              className="block h-full rounded-full bg-accent/70"
                              style={{ width: `${(area.mosquitoCount / maxCount) * 100}%` }}
                            />
                          </span>
                          <span className="font-semibold text-ink-soft">{f.number(area.mosquitoCount)}</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge tone={riskTone[area.risk]}>{t.enums.risk[area.risk]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader title={t.dashboard.fleet} action={<PillLink href="/devices">{t.common.seeAll}</PillLink>} />
            <ul className="mt-4 space-y-4">
              {fleet.map(({ type, total, active }) => {
                const Icon = typeIcon[type];
                return (
                  <li key={type} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center">
                      <Icon className="size-4 text-ink-soft" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{t.enums.deviceTypePlural[type]}</span>
                      <span className="block text-[11px] text-ink-faint">
                        {active} / {total} {t.enums.deviceStatus.ONLINE.toLowerCase()}
                      </span>
                    </span>
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/70">
                      <span className={`block h-full rounded-full ${barColor[type]}`} style={{ width: `${(active / total) * 100}%` }} />
                    </span>
                    <span className="w-9 text-right text-xs font-semibold text-ink-soft">{Math.round((active / total) * 100)}%</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <FieldSchedule t={t} f={f} today={now} />
        <ScenicCard text={t.dashboard.scenic} cta={t.dashboard.scenicCta} />
        <Card className="p-5">
          <CardHeader title={t.dashboard.activity} action={<PillLink href="/alerts">{t.common.seeAll}</PillLink>} />
          <ul className="mt-4 space-y-4">
            {alerts.slice(0, 4).map((alert) => (
              <li key={alert.id} className="flex gap-3">
                <AlertIcon alert={alert} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm leading-snug text-ink">
                    {alert.title} · <span className="font-semibold">{alert.location}</span>
                  </span>
                  <span className="block text-[11px] text-ink-faint">{f.ago(alert.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
