"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Minus, Plus } from "lucide-react";
import Link from "next/link";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { riskColor } from "@/components/ui/badge";
import { Select, Toggle } from "@/components/ui/fields";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { Dict } from "@/i18n/dictionaries/en";
import type { Area, Device, RiskLevel } from "@/lib/types";

type LayerId = "activity" | "risk" | "devices" | "boundaries";

const LAYERS: { id: LayerId; key: keyof Dict["map"] }[] = [
  { id: "activity", key: "activity" },
  { id: "risk", key: "riskAreas" },
  { id: "devices", key: "deviceLocations" },
  { id: "boundaries", key: "boundaries" },
];
const LEGEND: Record<RiskLevel, keyof Dict["map"]> = { HIGH: "highRisk", MEDIUM: "mediumRisk", LOW: "lowRisk" };

const RWANDA_CENTER: [number, number] = [29.95, -1.95];
const DEVICE_BLUE = "#5b4bd6";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function pin(color: string, size: number, ring: string, inner = "") {
  const el = document.createElement("button");
  el.type = "button";
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px ${ring},0 4px 6px -1px rgb(0 0 0/.15);cursor:pointer`;
  el.innerHTML = inner || `<span style="width:${size / 3}px;height:${size / 3}px;border-radius:9999px;background:#fff"></span>`;
  return el;
}

const ALERT_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

export function SurveillanceMap({
  devices,
  areas,
  styleUrl,
  focusDeviceId,
  focusArea,
}: {
  devices: Device[];
  areas: Area[];
  styleUrl: string;
  focusDeviceId?: string;
  focusArea?: string;
}) {
  const { t, f } = useI18n();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Record<"risk" | "devices", Marker[]>>({ risk: [], devices: [] });
  const [visible, setVisible] = useState<Record<LayerId, boolean>>({
    activity: true,
    risk: true,
    devices: true,
    boundaries: false,
  });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [area, setArea] = useState(focusArea ?? "");

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;

    (async () => {
      const maplibre = await import("maplibre-gl");
      if (cancelled || !container.current) return;
      maplibre.setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);

      map = new maplibre.Map({
        container: container.current,
        style: styleUrl,
        center: RWANDA_CENTER,
        zoom: 7.6,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      let loaded = false;
      // A missing tile after load is fine; failing before the style loads is not.
      map.on("error", () => !loaded && setFailed(true));

      map.on("load", () => {
        if (!map) return;
        loaded = true;
        setFailed(false);
        map.addSource("activity", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: areas.map((a) => ({
              type: "Feature",
              properties: { count: a.mosquitoCount },
              geometry: { type: "Point", coordinates: [a.lng, a.lat] },
            })),
          },
        });
        map.addLayer({
          id: "activity-heat",
          type: "heatmap",
          source: "activity",
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "count"], 0, 0, 650, 1],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 40, 11, 120],
            "heatmap-opacity": 0.55,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(16,185,129,0)",
              0.25, "rgba(16,185,129,0.5)",
              0.55, "rgba(245,158,11,0.6)",
              0.85, "rgba(244,63,94,0.75)",
            ],
          },
        });

        for (const a of areas) {
          const high = a.risk === "HIGH";
          const el = pin(riskColor[a.risk], high ? 30 : 24, `${riskColor[a.risk]}4d`, high ? ALERT_SVG : "");
          el.setAttribute("aria-label", `${a.name}: ${fmt(t.map.riskSuffix, { risk: t.enums.risk[a.risk] })}`);
          el.style.zIndex = "2"; // risk pins stay above nearby device pins
          const popup = new maplibre.Popup({ offset: 16 }).setHTML(
            `<p style="font-weight:600;color:#0f172a">${escapeHtml(a.name)}</p><p style="color:#64748b">${fmt(t.map.mosquitoes, { count: f.number(a.mosquitoCount) })} · ${fmt(t.map.riskSuffix, { risk: t.enums.risk[a.risk] })}</p><a href="/analytics" style="color:#7c3aed;font-weight:600">${t.map.areaAnalytics}</a>`,
          );
          const marker = new maplibre.Marker({ element: el }).setLngLat([a.lng, a.lat]).setPopup(popup).addTo(map);
          markers.current.risk.push(marker);
          if (a.name === focusArea) {
            map.jumpTo({ center: [a.lng, a.lat], zoom: 11 });
            marker.togglePopup();
          }
        }

        for (const d of devices) {
          const el = pin(d.status === "OFFLINE" ? "#94a3b8" : DEVICE_BLUE, 20, "rgb(59 130 246/.35)");
          el.setAttribute("aria-label", d.id);
          const popup = new maplibre.Popup({ offset: 14 }).setHTML(
            `<p style="font-weight:600;color:#0f172a">${d.id}</p><p style="color:#64748b">${t.enums.deviceType[d.type]} · ${t.enums.deviceStatus[d.status]}</p><a href="/devices/${d.id}" style="color:#7c3aed;font-weight:600">${t.map.viewDevice}</a>`,
          );
          const marker = new maplibre.Marker({ element: el }).setLngLat([d.lng, d.lat]).setPopup(popup).addTo(map);
          markers.current.devices.push(marker);
          if (d.id === focusDeviceId) {
            map.jumpTo({ center: [d.lng, d.lat], zoom: 11 });
            marker.togglePopup();
          }
        }
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      markers.current = { risk: [], devices: [] };
      map?.remove();
      mapRef.current = null;
    };
    // The map is built once per data set; layer visibility is synced below.
  }, [devices, areas, styleUrl, focusDeviceId, focusArea, t, f]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty("activity-heat", "visibility", visible.activity ? "visible" : "none");
    for (const key of ["risk", "devices"] as const) {
      for (const m of markers.current[key]) m.getElement().style.display = visible[key] ? "" : "none";
    }
    // Basemap styles name their admin borders "boundary…"; toggle whatever exists.
    for (const layer of map.getStyle().layers ?? []) {
      if (layer.id.includes("boundary")) {
        map.setLayoutProperty(layer.id, "visibility", visible.boundaries ? "visible" : "none");
      }
    }
  }, [visible, ready]);

  const flyToArea = (name: string) => {
    setArea(name);
    const target = areas.find((a) => a.name === name);
    mapRef.current?.flyTo(target ? { center: [target.lng, target.lat], zoom: 11 } : { center: RWANDA_CENTER, zoom: 7.6 });
  };

  const panel = "glass-strong rounded-2xl";

  return (
    <div className="flex h-full flex-col gap-4 px-4 pt-4 pb-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink">{t.map.title}</h1>
          <p className="mt-1 text-sm text-ink-soft/80">{t.map.description}</p>
        </div>
        <div className="flex gap-2.5">
          <Select label={t.map.allAreas} value={area} onChange={(e) => flyToArea(e.target.value)}>
            <option value="">{t.map.allAreas}</option>
            {areas.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select label={t.analytics.period} defaultValue="7">
            {[7, 30].map((d) => (
              <option key={d} value={d}>
                {fmt(t.common.lastDays, { days: d })}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="glass relative min-h-[520px] flex-1 overflow-hidden">
        {/* MapLibre sets position:relative on its container, so size it via a wrapper. */}
        <div className="absolute inset-0">
          <div ref={container} className="size-full" />
        </div>

        {failed && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-soft">{t.map.basemapError}</div>
        )}

        <div className={`absolute top-4 right-4 w-64 p-4 ${panel}`}>
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-sm font-semibold text-ink">{t.map.layers}</h2>
            <Layers className="size-4 text-ink-faint" aria-hidden />
          </div>
          <ul className="space-y-3">
            {LAYERS.map(({ id, key }) => (
              <li key={id} className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                {t.map[key]}
                <Toggle label={t.map[key]} checked={visible[id]} onChange={(v) => setVisible((s) => ({ ...s, [id]: v }))} />
              </li>
            ))}
          </ul>
        </div>

        <div className={`absolute bottom-4 left-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 ${panel}`}>
          {(Object.keys(riskColor) as RiskLevel[]).map((risk) => (
            <span key={risk} className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <span className="size-3 rounded-full ring-2 ring-white" style={{ background: riskColor[risk] }} />
              {t.map[LEGEND[risk]]}
            </span>
          ))}
          <span className="flex items-center gap-2 border-l border-white/80 pl-4 text-xs font-semibold text-ink-soft">
            <span className="size-3 rounded-full bg-device ring-2 ring-white" />
            {t.map.deviceLocation}
          </span>
        </div>

        <div className={`absolute right-4 bottom-4 flex flex-col overflow-hidden ${panel}`}>
          <button type="button" className="p-2.5 text-ink-soft hover:bg-accent-soft/60" onClick={() => mapRef.current?.zoomIn()} aria-label={t.map.zoomIn}>
            <Plus className="size-4" />
          </button>
          <button type="button" className="p-2.5 text-ink-soft hover:bg-accent-soft/60" onClick={() => mapRef.current?.zoomOut()} aria-label={t.map.zoomOut}>
            <Minus className="size-4" />
          </button>
        </div>

        {focusDeviceId && !devices.some((d) => d.id === focusDeviceId) && (
          <p className={`absolute top-4 left-4 px-3 py-2 text-xs text-ink-soft ${panel}`}>
            {fmt(t.map.deviceNotFound, { id: focusDeviceId })}{" "}
            <Link href="/map" className="font-semibold text-accent">
              {t.map.showAll}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
