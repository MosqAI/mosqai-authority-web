import { Activity, TriangleAlert, Wifi, WifiOff, Zap } from "lucide-react";
import type { Alert } from "@/lib/types";

const styles: Record<Alert["severity"], string> = {
  HIGH: "bg-rose-50 text-rose-500",
  MEDIUM: "bg-amber-50 text-amber-600",
  LOW: "bg-emerald-50 text-emerald-600",
  INFO: "bg-violet-50 text-violet-500",
};

export function AlertIcon({ alert, size = "md" }: { alert: Alert; size?: "sm" | "md" }) {
  const Icon =
    alert.kind === "DEVICE_OFFLINE"
      ? WifiOff
      : alert.kind === "DEVICE_ONLINE"
        ? Wifi
        : alert.kind === "RISK_AREA"
          ? Zap
          : alert.severity === "LOW"
            ? Activity
            : TriangleAlert;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${styles[alert.severity]} ${
        size === "sm" ? "size-8" : "size-9"
      }`}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}
