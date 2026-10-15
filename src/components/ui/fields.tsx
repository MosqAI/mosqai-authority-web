import { ChevronDown, Search } from "lucide-react";
import type { ComponentProps } from "react";

export function SearchField({
  className = "",
  label,
  shortcut,
  ...props
}: ComponentProps<"input"> & { label: string; shortcut?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        className="glass-strong w-full rounded-lg py-2.5 pr-14 pl-11 text-sm text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-accent/30 focus:outline-none"
        {...props}
      />
      {shortcut && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-lg bg-slate-900/5 px-2 py-0.5 text-[11px] font-medium text-ink-faint">
          {shortcut}
        </kbd>
      )}
    </label>
  );
}

export function Select({
  className = "",
  label,
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className={`relative inline-block ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        className="glass-strong w-full appearance-none rounded-lg py-2 pr-9 pl-4 text-xs font-medium text-ink focus:ring-2 focus:ring-accent/30 focus:outline-none"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-ink-soft" />
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        checked ? "bg-accent" : "bg-slate-300/80"
      }`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}
