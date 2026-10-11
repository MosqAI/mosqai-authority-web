// Locale-aware dates and numbers live in src/i18n/config.ts (`formatters`).

/** "+16%", "-4%", "+0.1%": sign always shown, one decimal below 1%. */
export function formatChange(change: number | null): string | undefined {
  if (change === null) return undefined;
  const pct = Math.abs(change * 100);
  return `${change < 0 ? "-" : "+"}${pct < 1 ? pct.toFixed(1) : Math.round(pct)}%`;
}
