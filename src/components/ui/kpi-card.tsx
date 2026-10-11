import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { Card } from "./card";

/** Stat tile: label, number, quiet icon and the change vs. the previous period. */
export function KpiCard({
  label,
  value,
  suffix,
  change,
  changeLabel,
  icon: Icon,
  higherIsBad = false,
  valueClassName = "text-ink",
}: {
  label: string;
  value: string;
  suffix?: string;
  change?: number | null;
  /** Formatted change, e.g. "+16%". */
  changeLabel?: string;
  icon: LucideIcon;
  /** For counts like risk areas, a rise is shown in red. */
  higherIsBad?: boolean;
  valueClassName?: string;
}) {
  const up = (change ?? 0) >= 0;
  const good = up !== higherIsBad;
  const Arrow = up ? ArrowUp : ArrowDown;

  return (
    <Card className="flex flex-col gap-2.5 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] text-ink-soft">{label}</h3>
        <Icon className="size-4 shrink-0 text-ink-faint" aria-hidden />
      </div>
      <p className={`text-2xl leading-none font-semibold tracking-tight ${valueClassName}`}>
        {value}
        {suffix && <span className="text-base font-normal text-ink-faint"> {suffix}</span>}
      </p>
      {changeLabel && (
        <span className={`inline-flex w-fit items-center gap-0.5 text-xs font-medium ${good ? "text-emerald-600" : "text-rose-600"}`}>
          <Arrow className="size-3" aria-hidden />
          {changeLabel.replace(/^[+-]/, "")}
        </span>
      )}
    </Card>
  );
}
