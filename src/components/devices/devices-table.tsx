"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, deviceStatusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchField, Select } from "@/components/ui/fields";
import { Pagination, paginate } from "@/components/ui/pagination";
import { dictionaries, fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { Area, Device, DeviceStatus, DeviceType } from "@/lib/types";
import { AddDeviceDialog } from "./add-device-dialog";

/** Matches id, area, sector and the type name in any supported language. */
export function filterDevices(devices: Device[], query: string, type: string, status: string) {
  const q = query.trim().toLowerCase();
  const typeNames = (t: DeviceType) => Object.values(dictionaries).map((d) => d.enums.deviceType[t]);
  return devices.filter(
    (d) =>
      (type === "" || d.type === type) &&
      (status === "" || d.status === status) &&
      (q === "" || [d.id, d.area, d.sector, ...typeNames(d.type)].some((v) => v.toLowerCase().includes(q))),
  );
}

function BatteryCell({ pct, noData }: { pct: number | null; noData: string }) {
  if (pct === null) return <span className="text-xs font-medium text-ink-faint">{noData}</span>;
  const color = pct < 25 ? "bg-rose-500" : pct < 50 ? "bg-amber-400" : "bg-[linear-gradient(90deg,#818cf8,#7c3aed)]";
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200/70">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className={`w-9 text-xs font-semibold ${pct < 25 ? "text-rose-600" : "text-ink-soft"}`}>{pct}%</span>
    </span>
  );
}

export function DevicesTable({
  devices,
  areas,
  initialQuery,
  openAdd = false,
  canAdd = true,
}: {
  devices: Device[];
  areas: Area[];
  initialQuery: string;
  openAdd?: boolean;
  /** Viewers cannot register devices. */
  canAdd?: boolean;
}) {
  const { t, f } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterDevices(devices, query, type, status), [devices, query, type, status]);
  const { rows, current, pageCount } = paginate(filtered, page);
  const resetPage =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            label={t.devices.searchPlaceholder}
            placeholder={t.devices.searchPlaceholder}
            className="w-full sm:w-72"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
          />
          <Select label={t.devices.type} value={type} onChange={(e) => resetPage(setType)(e.target.value)}>
            <option value="">{t.devices.allTypes}</option>
            {(Object.keys(t.enums.deviceType) as DeviceType[]).map((k) => (
              <option key={k} value={k}>
                {t.enums.deviceType[k]}
              </option>
            ))}
          </Select>
          <Select label={t.devices.status} value={status} onChange={(e) => resetPage(setStatus)(e.target.value)}>
            <option value="">{t.devices.allStatus}</option>
            {(Object.keys(t.enums.deviceStatus) as DeviceStatus[]).map((s) => (
              <option key={s} value={s}>
                {t.enums.deviceStatus[s]}
              </option>
            ))}
          </Select>
        </div>
        {canAdd && <AddDeviceDialog areas={areas} initialOpen={openAdd} />}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-ink-faint">
              <tr className="border-b border-white/60">
                <th className="px-6 py-4 font-medium">{t.devices.id}</th>
                <th className="px-6 py-4 font-medium">{t.devices.type}</th>
                <th className="px-6 py-4 font-medium">{t.devices.location}</th>
                <th className="px-6 py-4 font-medium">{t.devices.status}</th>
                <th className="px-6 py-4 font-medium">{t.devices.battery}</th>
                <th className="px-6 py-4 font-medium">{t.devices.lastSeen}</th>
                <th className="px-6 py-4 text-center font-medium">{t.devices.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="transition hover:bg-accent-soft/60">
                  <td className="px-6 py-4 font-semibold text-ink">
                    <Link href={`/devices/${d.id}`} className="hover:text-accent">
                      {d.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{t.enums.deviceType[d.type]}</td>
                  <td className="px-6 py-4 text-ink-soft">{d.area}</td>
                  <td className="px-6 py-4">
                    <Badge tone={deviceStatusTone[d.status]}>{t.enums.deviceStatus[d.status]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <BatteryCell pct={d.batteryPct} noData={t.common.noData} />
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{d.lastSeenAt ? f.date(d.lastSeenAt) : t.devices.never}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 text-ink-faint">
                      <Link href={`/devices/${d.id}`} aria-label={fmt(t.devices.edit, { id: d.id })} className="hover:text-ink">
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={fmt(t.devices.remove, { id: d.id })}
                        title={t.common.needsBackend}
                        disabled
                        className="disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ink-soft">
                    {t.devices.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={current} pageCount={pageCount} total={filtered.length} onChange={setPage} />
      </Card>
    </>
  );
}
