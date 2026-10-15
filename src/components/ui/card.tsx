import type { ComponentProps } from "react";

/** Flat white panel with a hairline border, the base surface of every screen. */
export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`glass ${className}`} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Quiet "See all" link used in card headers. */
export function PillLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className="text-xs text-ink-soft transition hover:text-accent"
      {...props}
    >
      {children}
    </a>
  );
}
