"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

export const PAGE_SIZE = 5;

export function paginate<T>(items: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  return {
    pageCount,
    current,
    rows: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
  };
}

/** Page numbers to show: all when few, otherwise 1 2 3 … last around the current page. */
function pageList(current: number, count: number): (number | "…")[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1);
  const start = Math.min(Math.max(1, current - 1), count - 3);
  const pages: (number | "…")[] = [start, start + 1, start + 2];
  if (start + 3 < count) pages.push("…");
  pages.push(count);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  total,
  noun,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  noun?: string;
  onChange: (page: number) => void;
}) {
  const { t } = useI18n();
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const btn =
    "flex size-8 items-center justify-center rounded-lg text-xs font-semibold text-ink-soft transition hover:bg-accent-soft/60 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 px-6 py-3.5">
      <p className="text-xs text-ink-soft">
        {fmt(t.common.showing, { from, to, total })}
        {noun && ` ${noun}`}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label={t.common.previousPage}>
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-ink-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={p === page ? `${btn} bg-accent text-white hover:bg-accent` : btn}
            >
              {p}
            </button>
          ),
        )}
        <button
          className={btn}
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label={t.common.nextPage}
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
