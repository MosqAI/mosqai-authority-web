"use client";

import { Camera, Clock, Download, FileText, Plus, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/fields";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination, paginate } from "@/components/ui/pagination";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { formatChange } from "@/lib/format";
import type { DashboardSummary, Report, ReportType } from "@/lib/types";

const RANGES = [7, 30];

function downloadCsv(report: Report, typeName: string) {
  const rows = [
    ["date", "type", "areas", "status"],
    [report.date.slice(0, 10), typeName, String(report.areas), report.status],
  ];
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
  Object.assign(document.createElement("a"), {
    href: url,
    download: `mosqai-${report.type.toLowerCase()}-${report.date.slice(0, 10)}.csv`,
  }).click();
  URL.revokeObjectURL(url);
}

export function ReportsView({ reports: initial, summary }: { reports: Report[]; summary: DashboardSummary }) {
  const { t, f } = useI18n();
  const [reports, setReports] = useState(initial);
  const [type, setType] = useState("");
  const [days, setDays] = useState(RANGES[0]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const newest = Math.max(...reports.map((r) => Date.parse(r.date)));
    const cutoff = newest - days * 24 * 60 * 60 * 1000;
    return reports.filter((r) => (type === "" || r.type === type) && Date.parse(r.date) > cutoff);
  }, [reports, type, days]);
  const { rows, current, pageCount } = paginate(filtered, page);

  // Queues a report locally; the backend will generate the file.
  const generate = () =>
    setReports((all) => [
      {
        id: `rep-new-${all.length}`,
        date: new Date().toISOString(),
        type: (type || "MOSQUITO_ACTIVITY") as ReportType,
        areas: 12,
        status: "PROCESSING",
      },
      ...all,
    ]);

  return (
    <>
      <PageHeader
        title={t.reports.title}
        description={t.reports.description}
        actions={
          <>
            <Select
              label={t.reports.reportType}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.reports.allTypes}</option>
              {(Object.keys(t.enums.reportType) as ReportType[]).map((k) => (
                <option key={k} value={k}>
                  {t.enums.reportType[k]}
                </option>
              ))}
            </Select>
            <Select
              label={t.reports.dateRange}
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(1);
              }}
            >
              {RANGES.map((d) => (
                <option key={d} value={d}>
                  {fmt(t.common.lastDays, { days: d })}
                </option>
              ))}
            </Select>
            <Button onClick={generate}>
              <Plus className="size-4" aria-hidden /> {t.reports.generate}
            </Button>
          </>
        }
      />

      <section aria-label={t.reports.title} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t.reports.totalReports} value={f.number(summary.totalReports.value)} changeLabel={formatChange(summary.totalReports.change)} change={summary.totalReports.change} icon={FileText} />
        <KpiCard label={t.reports.newCaptures} value={f.number(summary.captures.value)} changeLabel={formatChange(summary.captures.change)} change={summary.captures.change} icon={Camera} />
        <KpiCard label={t.reports.highRiskAlerts} value={String(summary.highRiskAreas.value)} changeLabel={formatChange(summary.highRiskAreas.change)} change={summary.highRiskAreas.change} icon={TriangleAlert} higherIsBad />
        <KpiCard label={t.reports.uptime} value={`${summary.uptimePct.value}%`} changeLabel={formatChange(summary.uptimePct.change)} change={summary.uptimePct.change} icon={Clock} />
      </section>

      <Card className="overflow-hidden">
        <h2 className="px-6 pt-5 pb-2 text-base font-semibold text-ink">{t.reports.recent}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-ink-faint">
              <tr className="border-b border-white/60">
                <th className="px-6 py-3 font-medium">{t.reports.date}</th>
                <th className="px-6 py-3 font-medium">{t.reports.type}</th>
                <th className="px-6 py-3 text-center font-medium">{t.reports.areas}</th>
                <th className="px-6 py-3 text-center font-medium">{t.reports.status}</th>
                <th className="px-6 py-3 text-right font-medium">{t.reports.action}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="transition hover:bg-accent-soft/60">
                  <td className="px-6 py-3.5 font-semibold text-ink">{f.date(r.date)}</td>
                  <td className="px-6 py-3.5 text-ink-soft">{t.enums.reportType[r.type]}</td>
                  <td className="px-6 py-3.5 text-center text-ink-soft">{r.areas}</td>
                  <td className="px-6 py-3.5 text-center">
                    {r.status === "COMPLETED" ? (
                      <Badge tone="success">{t.reports.completed}</Badge>
                    ) : (
                      <Badge tone="info">{t.reports.processing}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => downloadCsv(r, t.enums.reportType[r.type])}
                      disabled={r.status !== "COMPLETED"}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      <Download className="size-3.5" aria-hidden /> {t.reports.download}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-soft">
                    {t.reports.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={current} pageCount={pageCount} total={filtered.length} noun={t.reports.noun} onChange={setPage} />
      </Card>
    </>
  );
}
