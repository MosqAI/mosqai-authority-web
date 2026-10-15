"use client";

import {
  ArrowDown,
  ArrowUp,
  Bug,
  CircleAlert,
  CircleCheck,
  Download,
  Info,
  Lightbulb,
  MapPin,
  Power,
  Radar,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, riskTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/fields";
import { PageHeader } from "@/components/ui/page-header";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import {
  computeAreaStats,
  dailyTotals,
  generateInsights,
  peakWindow,
  speciesTotals,
  type AreaStat,
  type Insight,
  type InsightLevel,
} from "@/lib/analytics";
import { formatChange } from "@/lib/format";
import type { Area, AreaDay } from "@/lib/types";
import { AreaBars, CapturesTrend, HourlyBars, Sparkline, SpeciesDonut } from "./analytics-charts";

const PERIODS = [7, 14, 30];

const levelStyle: Record<InsightLevel, { icon: LucideIcon; tint: string; chip: string }> = {
  critical: { icon: CircleAlert, tint: "text-rose-500", chip: "bg-rose-50 text-rose-600" },
  warning: { icon: TriangleAlert, tint: "text-amber-500", chip: "bg-amber-50 text-amber-700" },
  info: { icon: Info, tint: "text-violet-500", chip: "bg-violet-50 text-violet-700" },
  positive: { icon: CircleCheck, tint: "text-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
};

type SortKey = "rate" | "captures" | "change" | "anophelesShare" | "coverage";

const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);

function exportCsv(stats: AreaStat[], days: number) {
  const header = ["area", "district", "captures", "captures_per_trap_day", "change_vs_prev", "anopheles_share", "coverage", "no_data_days", "risk"];
  const rows = stats.map((s) => [
    s.area,
    s.district,
    s.captures,
    s.rate?.toFixed(2) ?? "",
    s.change?.toFixed(3) ?? "",
    s.anophelesShare?.toFixed(3) ?? "",
    s.coverage.toFixed(3),
    s.noDataDays,
    s.risk,
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: `mosqai-area-analytics-${days}d.csv` }).click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: LucideIcon }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-medium text-ink-soft/80">{label}</h3>
        <Icon className="size-4 text-ink-faint" aria-hidden />
      </div>
      <p className="text-2xl leading-none font-bold tracking-tight text-ink">{value}</p>
      <p className="text-[11px] text-ink-faint">{sub}</p>
    </Card>
  );
}

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink-faint">—</span>;
  const up = value >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  // For mosquito activity, a rise is bad.
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-rose-600" : "text-emerald-600"}`}
    >
      <Arrow className="size-3" aria-hidden />
      {formatChange(value)!.replace(/^[+-]/, "")}
    </span>
  );
}

export function AnalyticsView({ areas, series, hourly }: { areas: Area[]; series: AreaDay[]; hourly: number[] }) {
  const { t, f } = useI18n();
  const [days, setDays] = useState(7);
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<SortKey>("rate");
  const [showAllInsights, setShowAllInsights] = useState(false);

  const districts = useMemo(() => [...new Set(areas.map((a) => a.district))].sort(), [areas]);
  const scopedAreas = useMemo(() => areas.filter((a) => !district || a.district === district), [areas, district]);
  const scopedSeries = useMemo(() => {
    const names = new Set(scopedAreas.map((a) => a.name));
    return series.filter((d) => names.has(d.area));
  }, [series, scopedAreas]);

  const stats = useMemo(() => computeAreaStats(scopedAreas, scopedSeries, days), [scopedAreas, scopedSeries, days]);
  const insights = useMemo(() => generateInsights(stats, hourly, days), [stats, hourly, days]);
  const totals = useMemo(() => dailyTotals(scopedSeries, days), [scopedSeries, days]);
  const species = useMemo(() => speciesTotals(scopedSeries, days), [scopedSeries, days]);
  const peak = useMemo(() => peakWindow(hourly), [hourly]);

  const captures = stats.reduce((a, s) => a + s.captures, 0);
  const prevCaptures = stats.reduce((a, s) => a + s.prevCaptures, 0);
  const speciesSum = Object.values(species).reduce((a, b) => a + b, 0);
  const anophelesShare = speciesSum ? species.ANOPHELES / speciesSum : null;
  const reportingNow = stats.reduce((a, s) => a + s.reportingNow, 0);
  const totalDevices = stats.reduce((a, s) => a + s.totalDevices, 0);
  const hotspots = stats.filter((s) => (s.change ?? 0) >= 0.25 || (s.anophelesShare ?? 0) >= 0.4).length;

  const sorted = [...stats].sort((a, b) => (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity));
  const visibleInsights = showAllInsights ? insights : insights.slice(0, 6);
  const text = (i: Insight) => t.analytics.insight[i.kind];
  const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

  const sortHeader = (key: SortKey) => (
    <th className="px-4 py-3 text-right font-medium" aria-sort={sort === key ? "descending" : "none"}>
      <button type="button" onClick={() => setSort(key)} className={`hover:text-ink ${sort === key ? "text-ink" : ""}`}>
        {t.analytics.cols[key === "anophelesShare" ? "anopheles" : key]}
        {sort === key && " ↓"}
      </button>
    </th>
  );

  return (
    <>
      <PageHeader
        title={t.analytics.title}
        description={t.analytics.description}
        actions={
          <>
            <Select label={t.analytics.district} value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">{t.analytics.allDistricts}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select label={t.analytics.period} value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {fmt(t.common.lastDays, { days: p })}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => exportCsv(sorted, days)}>
              <Download className="size-4" aria-hidden /> {t.common.exportCsv}
            </Button>
          </>
        }
      />

      <section aria-label={t.analytics.title} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t.analytics.captures} value={f.number(captures)} icon={Bug} sub={fmt(t.analytics.capturesSub, { count: f.number(prevCaptures), days })} />
        <Stat label={t.analytics.vectorShare} value={pct(anophelesShare)} icon={TriangleAlert} sub={t.analytics.vectorShareSub} />
        <Stat label={t.analytics.hotspots} value={`${hotspots} / ${stats.length}`} icon={MapPin} sub={t.analytics.hotspotsSub} />
        <Stat label={t.analytics.coverage} value={`${reportingNow} / ${totalDevices}`} icon={Radar} sub={t.analytics.coverageSub} />
      </section>

      <Card className="p-6">
        <CardHeader
          title={t.analytics.insights}
          description={fmt(t.analytics.insightsSub, { days })}
          action={
            <span className="flex">
              <Lightbulb className="size-4 text-ink-faint" aria-hidden />
            </span>
          }
        />
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {visibleInsights.map((insight) => {
            const style = levelStyle[insight.level];
            const Icon = style.icon;
            const copy = text(insight);
            return (
              <li key={insight.id} className="glass-strong flex gap-3 rounded-2xl p-4">
                <span className="mt-0.5 flex shrink-0">
                  <Icon className={`size-5 ${style.tint}`} aria-hidden />
                </span>
                <div className="min-w-0">
                  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium ${style.chip}`}>
                    {t.analytics.levels[insight.level]}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-ink">{fmt(copy.title, insight.params)}</h3>
                  <p className="mt-1 text-xs text-ink-soft">{fmt(copy.detail, insight.params)}</p>
                  <p className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-ink">
                    <span className="font-semibold text-accent-strong">{t.analytics.todo}. </span>
                    {fmt(copy.action, insight.params)}
                  </p>
                  {insight.area && (
                    <Link
                      href={`/map?area=${encodeURIComponent(insight.area)}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      <MapPin className="size-3" aria-hidden /> {t.analytics.viewArea}
                    </Link>
                  )}
                  {insight.area && (insight.kind === "coverage" || insight.kind === "noReporting" || insight.kind === "gap") && (
                    <Link
                      href={`/devices?q=${encodeURIComponent(insight.area)}`}
                      className="mt-2 ml-4 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      <Power className="size-3" aria-hidden /> {t.analytics.seeDevices}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {insights.length > 6 && (
          <button type="button" onClick={() => setShowAllInsights((v) => !v)} className="mt-4 text-xs font-semibold text-accent hover:underline">
            {showAllInsights ? t.analytics.showFewer : fmt(t.analytics.showAll, { count: insights.length })}
          </button>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="min-w-0 p-6 xl:col-span-3">
          <CardHeader
            title={t.analytics.daily}
            description={t.analytics.dailySub}
            action={
              <div className="flex gap-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-accent" /> {t.dashboard.total}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-violet" /> {t.analytics.anopheles}
                </span>
              </div>
            }
          />
          <div className="mt-4">
            <CapturesTrend data={totals} />
          </div>
        </Card>
        <Card className="min-w-0 p-6 xl:col-span-2">
          <CardHeader title={t.analytics.species} description={t.analytics.speciesSub} />
          <div className="mt-5">
            <SpeciesDonut totals={species} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="min-w-0 p-6 xl:col-span-3">
          <CardHeader title={t.analytics.byArea} description={t.analytics.byAreaSub} />
          <div className="mt-4">
            <AreaBars
              data={sorted
                .filter((s) => s.rate !== null)
                .sort((a, b) => b.rate! - a.rate!)
                .map((s) => ({ area: s.area, rate: Number(s.rate!.toFixed(1)), risk: s.risk }))}
            />
          </div>
        </Card>
        <Card className="min-w-0 p-6 xl:col-span-2">
          <CardHeader
            title={t.analytics.byHour}
            description={fmt(t.analytics.byHourSub, { start: hh(peak.start), end: hh(peak.end), share: pct(peak.share) })}
          />
          <div className="mt-4">
            <HourlyBars data={hourly} peak={peak} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold text-ink">{t.analytics.comparison}</h2>
          <p className="mt-1 text-xs text-ink-soft/80">{t.analytics.comparisonSub}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs text-ink-faint">
              <tr className="border-y border-white/60">
                <th className="px-6 py-3 font-medium">{t.analytics.cols.area}</th>
                {sortHeader("captures")}
                {sortHeader("rate")}
                {sortHeader("change")}
                {sortHeader("anophelesShare")}
                {sortHeader("coverage")}
                <th className="px-4 py-3 font-medium">{t.analytics.cols.trend}</th>
                <th className="px-6 py-3 text-right font-medium">{t.analytics.cols.risk}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.area} className="transition hover:bg-accent-soft/60">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-ink">{s.area}</p>
                    <p className="text-[11px] text-ink-faint">{s.district}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{f.number(s.captures)}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{s.rate === null ? "—" : s.rate.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    <Change value={s.change} />
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${(s.anophelesShare ?? 0) >= 0.4 ? "text-rose-600" : "text-ink-soft"}`}>
                    {pct(s.anophelesShare)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.reportingNow < s.totalDevices ? (
                      <Badge tone={s.reportingNow === 0 ? "danger" : "warning"}>{fmt(t.analytics.reporting, { now: s.reportingNow, total: s.totalDevices })}</Badge>
                    ) : s.noDataDays > 0 ? (
                      <Badge tone="info">{fmt(t.analytics.noDataDays, { days: s.noDataDays })}</Badge>
                    ) : (
                      <span className="text-ink-soft">{pct(s.coverage)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Sparkline values={s.daily} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Badge tone={riskTone[s.risk]}>{t.enums.risk[s.risk]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
