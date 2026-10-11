import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "dark" | "secondary" | "soft";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  dark: "bg-ink text-white hover:bg-brand-deep",
  secondary: "border border-glass-border bg-white text-ink hover:bg-glass-strong",
  soft: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
