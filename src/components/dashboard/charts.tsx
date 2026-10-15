"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useI18n } from "@/i18n/client";

const BLUE = "#7c3aed";
const VIOLET = "#e26d9f";

export interface ActivityPoint {
  date: string;
  captures: number | null;
  anopheles: number | null;
}

function TooltipPill({ active, payload }: { active?: boolean; payload?: { value: number; dataKey: string }[] }) {
  const { f } = useI18n();
  if (!active || !payload?.length) return null;
  const total = payload.find((p) => p.dataKey === "captures")?.value;
  const an = payload.find((p) => p.dataKey === "anopheles")?.value;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs">
      <span className="font-bold text-ink">{total != null ? f.number(total) : "—"}</span>
      {an != null && <span className="ml-2 font-semibold text-violet-500">{f.number(an)}</span>}
    </div>
  );
}

/** Smooth two-series area chart in the design's blue / violet. Null days stay as gaps. */
export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const { f } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="fill-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.45} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="fill-violet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIOLET} stopOpacity={0.5} />
            <stop offset="100%" stopColor={VIOLET} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.25)" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => f.shortDate(`${d}T12:00:00Z`)}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          minTickGap={18}
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip content={<TooltipPill />} cursor={{ stroke: "rgba(124,58,237,0.35)", strokeDasharray: "4 4" }} />
        <Area type="monotone" dataKey="captures" stroke={BLUE} strokeWidth={2.5} fill="url(#fill-blue)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
        <Area type="monotone" dataKey="anopheles" stroke={VIOLET} strokeWidth={2} fill="url(#fill-violet)" activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
