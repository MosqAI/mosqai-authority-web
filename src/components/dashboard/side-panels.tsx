import { ArrowRight, ChevronLeft, ChevronRight, ClipboardCheck, ShieldAlert, Wrench } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Dict } from "@/i18n/dictionaries/en";
import type { Formatters } from "@/i18n/config";

/** Mini calendar strip + this week's field schedule (design's right-hand calendar card). */
export function FieldSchedule({ t, f, today }: { t: Dict; f: Formatters; today: Date }) {
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
  const week = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  const events = [
    { title: t.dashboard.events.trapCheck, time: "08:00 – 11:00", bar: "bg-accent", icon: ClipboardCheck, iconTone: "text-indigo-500" },
    { title: t.dashboard.events.maintenance, time: "11:30 – 13:00", bar: "bg-violet-500", icon: Wrench, iconTone: "text-violet-500" },
    { title: t.dashboard.events.review, time: "15:00 – 16:00", bar: "bg-amber-500", icon: ShieldAlert, iconTone: "text-amber-500" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink capitalize">{f.month(today)}</h3>
        <div className="flex gap-1 text-ink-soft">
          <ChevronLeft className="size-4" aria-hidden />
          <ChevronRight className="size-4" aria-hidden />
        </div>
      </div>
      <p className="mt-0.5 text-xs text-ink-faint">{t.dashboard.calendar}</p>
      <ol className="mt-4 grid grid-cols-7 text-center">
        {week.map((d) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <li key={d.toISOString()} className="flex flex-col items-center gap-2">
              <span className="text-[11px] text-ink-faint">{f.weekday(d)}</span>
              <span
                className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-accent text-white" : "text-ink"
                }`}
              >
                {d.getDate()}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-5 space-y-3">
        {events.map(({ title, time, bar, icon: Icon, iconTone }) => (
          <li key={title} className="flex items-center gap-3">
            <span className={`h-9 w-1 rounded-full ${bar}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{title}</span>
              <span className="block text-xs text-ink-faint">{time}</span>
            </span>
            <span className="glass-strong flex size-8 items-center justify-center rounded-full">
              <Icon className={`size-4 ${iconTone}`} aria-hidden />
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/analytics"
        className="glass-strong mt-5 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-semibold text-ink transition hover:bg-white"
      >
        {t.dashboard.viewAllEvents} <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </Card>
  );
}

/** Call to action card: deep indigo panel with a serif line and a hand-drawn trap. */
export function ScenicCard({ text, cta }: { text: string; cta: string }) {
  return (
    <Link href="/devices" className="group relative block overflow-hidden rounded-2xl bg-brand-deep p-5 text-white">
      <svg className="absolute -right-4 -bottom-6 h-32 w-32 text-white/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M30 20h40l-6 14H36z" />
        <path d="M36 34v40a14 14 0 0 0 28 0V34" />
        <path d="M42 48h16M42 58h16M42 68h16" />
        <path d="M50 8v12" />
      </svg>
      <p className="relative max-w-[85%] font-display text-xl leading-snug">{text}</p>
      <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#d8c8ff] group-hover:text-white">
        {cta} <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}
