import type { AlertSeverity, DeviceStatus, RiskLevel } from "@/lib/types";

export type Tone = "success" | "danger" | "warning" | "info" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-violet-50 text-violet-700",
  neutral: "bg-slate-100 text-slate-600",
};

/** Small, quiet status label. */
export function Badge({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium leading-none whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const deviceStatusTone: Record<DeviceStatus, Tone> = {
  ONLINE: "success",
  OFFLINE: "danger",
  WARNING: "warning",
};

export const riskTone: Record<RiskLevel, Tone> = { HIGH: "danger", MEDIUM: "warning", LOW: "success" };

export const severityTone: Record<AlertSeverity, Tone> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "success",
  INFO: "info",
};

/** Solid colour per risk level, shared by the map, legend and charts. */
export const riskColor: Record<RiskLevel, string> = {
  HIGH: "#f43f5e",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};
