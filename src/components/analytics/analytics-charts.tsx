"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { riskColor } from "@/components/ui/badge";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { RiskLevel, Species } from "@/lib/types";
import { ActivityChart, type ActivityPoint } from "@/components/dashboard/charts";

const axis = { fontSize: 11, fill: "#64748b" };
const tooltipStyle = {
  fontSize: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.8)",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 10px 30px -12px rgba(30,41,59,0.3)",
};

export const speciesColor: Record<Species, string> = {
  ANOPHELES: "#f43f5e",
  CULEX: "#7c3aed",
  AEDES: "#e26d9f",
  OTHER: "#cbd5e1",
};

/** Gaps (null) are drawn as breaks: a day without data is unknown, not zero. */
export function CapturesTrend({ data }: { data: ActivityPoint[] }) {
  return <ActivityChart data={data} />;
}

export function AreaBars({ data }: { data: { area: string; rate: number; risk: RiskLevel }[] }) {
  const { t } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(148,163,184,0.25)" />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="area" width={150} tick={{ ...axis, fill: "#334155" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [fmt(t.analytics.perTrapDay, { value: Number(v).toFixed(1) }), ""]}
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.4)" }}
        />
        <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={12}>
          {data.map((d) => (
            <Cell key={d.area} fill={riskColor[d.risk]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HourlyBars({ data, peak }: { data: number[]; peak: { start: number; end: number } }) {
  const { t } = useI18n();
  const inPeak = (h: number) => (peak.start <= peak.end ? h >= peak.start && h < peak.end : h >= peak.start || h < peak.end);
  const rows = data.map((share, hour) => ({ hour: String(hour).padStart(2, "0"), share }));
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={rows} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
        <XAxis dataKey="hour" tick={axis} axisLine={false} tickLine={false} interval={2} />
        <YAxis tick={axis} axisLine={false} tickLine={false} unit="%" />
        <Tooltip
          formatter={(v) => [fmt(t.analytics.ofCaptures, { value: Number(v).toFixed(1) }), ""]}
          labelFormatter={(h) => `${h}:00`}
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.4)" }}
        />
        <Bar dataKey="share" radius={[6, 6, 0, 0]}>
          {rows.map((r, h) => (
            <Cell key={r.hour} fill={inPeak(h) ? "#7c3aed" : "#c7d2fe"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SpeciesDonut({ totals }: { totals: Record<Species, number> }) {
  const { t, f } = useI18n();
  const data = (Object.keys(totals) as Species[]).map((s) => ({ species: s, value: totals[s] }));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative size-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="72%" outerRadius="100%" paddingAngle={3} cornerRadius={6} stroke="none">
              {data.map((d) => (
                <Cell key={d.species} fill={speciesColor[d.species]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">{t.analytics.identified}</span>
          <span className="text-xl font-bold text-ink">{f.number(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-3 text-xs">
        {data.map(({ species, value }) => (
          <li key={species} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-ink">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: speciesColor[species] }} />
              <span>
                <span className="block font-semibold">{t.enums.species[species]}</span>
                <span className="block text-[11px] text-ink-faint">{t.enums.speciesNote[species]}</span>
              </span>
            </span>
            <span className="font-bold text-ink">{total ? Math.round((value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Inline sparkline; breaks the line at NO_DATA days. */
export function Sparkline({ values }: { values: (number | null)[] }) {
  const known = values.filter((v): v is number => v !== null);
  if (known.length < 2) return <span className="text-[11px] text-ink-faint">—</span>;
  const max = Math.max(...known);
  const min = Math.min(...known);
  const w = 88;
  const h = 24;
  const x = (i: number) => (i / (values.length - 1)) * w;
  const y = (v: number) => h - 2 - ((v - min) / (max - min || 1)) * (h - 4);
  const segments: string[] = [];
  let current = "";
  values.forEach((v, i) => {
    if (v === null) {
      if (current) segments.push(current);
      current = "";
    } else current += `${current ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
  });
  if (current) segments.push(current);
  return (
    <svg width={w} height={h} aria-hidden className="overflow-visible">
      {segments.map((d) => (
        <path key={d} d={d} fill="none" stroke="#7c3aed" strokeWidth={1.75} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
