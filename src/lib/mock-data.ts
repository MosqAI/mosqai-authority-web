// Seed data shaped like the backend's REST responses. Replaced by real calls in
// `api.ts` once the backend endpoints exist (roadmap M4).
import type {
  AreaDay,
  Alert,
  Area,
  DashboardSummary,
  Device,
  DeviceStatus,
  DeviceSync,
  DeviceType,
  Report,
  TrendPoint,
  User,
} from "./types";

const HOUR = 60 * 60 * 1000;
const hoursAgo = (h: number) => new Date(Date.now() - h * HOUR).toISOString();

const SITES: Record<string, { district: string; lat: number; lng: number }> = {
  Gicumbi: { district: "Gicumbi", lat: -1.5763, lng: 30.0675 },
  Nyabihu: { district: "Nyabihu", lat: -1.6539, lng: 29.5106 },
  Musanze: { district: "Musanze", lat: -1.4998, lng: 29.6344 },
  Rubavu: { district: "Rubavu", lat: -1.6792, lng: 29.2591 },
  Nyarugenge: { district: "Kigali", lat: -1.9536, lng: 30.045 },
  Kicukiro: { district: "Kigali", lat: -1.9706, lng: 30.1044 },
  Gasabo: { district: "Kigali", lat: -1.8916, lng: 30.0997 },
  Rwamagana: { district: "Rwamagana", lat: -1.9487, lng: 30.4347 },
  Muhanga: { district: "Muhanga", lat: -2.0845, lng: 29.7564 },
  Bugesera: { district: "Bugesera", lat: -2.2073, lng: 30.1512 },
  Nyanza: { district: "Nyanza", lat: -2.3517, lng: 29.7509 },
};

// [type, site, status, battery]
const DEVICE_SEED: [DeviceType, keyof typeof SITES, DeviceStatus, number | null][] = [
  ["MOSQUITO_TRAP", "Gicumbi", "ONLINE", 78],
  ["CAMERA_TRAP", "Nyabihu", "ONLINE", 66],
  ["WEATHER_SENSOR", "Musanze", "ONLINE", 92],
  ["MOSQUITO_TRAP", "Rubavu", "OFFLINE", null],
  ["CAMERA_TRAP", "Nyarugenge", "ONLINE", 87],
  ["MOSQUITO_TRAP", "Kicukiro", "ONLINE", 81],
  ["MOSQUITO_TRAP", "Gasabo", "ONLINE", 74],
  ["MOSQUITO_TRAP", "Rwamagana", "ONLINE", 69],
  ["MOSQUITO_TRAP", "Muhanga", "ONLINE", 58],
  ["CAMERA_TRAP", "Bugesera", "ONLINE", 90],
  ["MOSQUITO_TRAP", "Nyanza", "ONLINE", 63],
  ["MOSQUITO_TRAP", "Kicukiro", "WARNING", 18],
  ["MOSQUITO_TRAP", "Nyarugenge", "ONLINE", 84],
  ["WEATHER_SENSOR", "Gasabo", "ONLINE", 96],
  ["MOSQUITO_TRAP", "Musanze", "ONLINE", 71],
  ["CAMERA_TRAP", "Gicumbi", "ONLINE", 77],
  ["MOSQUITO_TRAP", "Rubavu", "ONLINE", 88],
  ["MOSQUITO_TRAP", "Bugesera", "ONLINE", 52],
  ["MOSQUITO_TRAP", "Muhanga", "ONLINE", 67],
  ["CAMERA_TRAP", "Rwamagana", "ONLINE", 83],
  ["WEATHER_SENSOR", "Nyabihu", "OFFLINE", null],
  ["MOSQUITO_TRAP", "Nyanza", "ONLINE", 79],
  ["MOSQUITO_TRAP", "Gasabo", "ONLINE", 61],
  ["WEATHER_SENSOR", "Kicukiro", "ONLINE", 89],
  ["MOSQUITO_TRAP", "Nyarugenge", "ONLINE", 72],
  ["MOSQUITO_TRAP", "Gicumbi", "ONLINE", 85],
];

// Deterministic offset (up to ~6 km) so devices don't stack on their site's area marker.
const jitter = (i: number) => {
  const step = ((i * 37) % 11) - 5;
  return (step === 0 ? 3 : step) / 90;
};

export const devices: Device[] = DEVICE_SEED.map(([type, site, status, batteryPct], i) => {
  const s = SITES[site];
  return {
    id: `MSQ-${String(i + 1).padStart(3, "0")}`,
    type,
    area: site,
    sector: `${site} - Sector ${(i % 4) + 1}`,
    status,
    batteryPct,
    lastSeenAt: status === "OFFLINE" ? "2026-09-28T16:40:00Z" : "2026-09-29T06:12:00Z",
    installedAt: "2026-09-10T08:00:00Z",
    nextMaintenanceAt: "2026-10-10T08:00:00Z",
    lat: s.lat + jitter(i),
    lng: s.lng + jitter(i + 3),
  };
});

export const deviceSyncs: DeviceSync[] = [
  { at: "2026-09-29T06:12:00Z", captures: 12 },
  { at: "2026-09-26T04:47:00Z", captures: 8 },
  { at: "2026-09-24T04:31:00Z", captures: 15 },
  { at: "2026-09-21T16:04:00Z", captures: 10 },
  { at: "2026-09-20T05:15:00Z", captures: 6 },
];

export const areas: Area[] = [
  { name: "Kicukiro - Sector 3", site: "Kicukiro", ...SITES.Kicukiro, mosquitoCount: 612, risk: "HIGH" },
  { name: "Nyarugenge - Center", site: "Nyarugenge", ...SITES.Nyarugenge, mosquitoCount: 498, risk: "HIGH" },
  { name: "Gasabo - Remera", site: "Gasabo", ...SITES.Gasabo, mosquitoCount: 421, risk: "MEDIUM" },
  { name: "Muhanga - Downtown", site: "Muhanga", ...SITES.Muhanga, mosquitoCount: 367, risk: "MEDIUM" },
  { name: "Rubavu - Gisenyi", site: "Rubavu", ...SITES.Rubavu, mosquitoCount: 289, risk: "LOW" },
  { name: "Gicumbi - Byumba", site: "Gicumbi", ...SITES.Gicumbi, mosquitoCount: 244, risk: "MEDIUM" },
  { name: "Bugesera - Nyamata", site: "Bugesera", ...SITES.Bugesera, mosquitoCount: 236, risk: "HIGH" },
  { name: "Musanze - Muhoza", site: "Musanze", ...SITES.Musanze, mosquitoCount: 198, risk: "MEDIUM" },
  { name: "Rwamagana - Kigabiro", site: "Rwamagana", ...SITES.Rwamagana, mosquitoCount: 176, risk: "LOW" },
  { name: "Nyabihu - Mukamira", site: "Nyabihu", ...SITES.Nyabihu, mosquitoCount: 154, risk: "MEDIUM" },
  { name: "Nyanza - Busasamana", site: "Nyanza", ...SITES.Nyanza, mosquitoCount: 121, risk: "LOW" },
  { name: "Gasabo - Kimironko", site: "Gasabo", lat: -1.9355, lng: 30.1286, district: "Kigali", mosquitoCount: 98, risk: "LOW" },
];

export const alerts: Alert[] = [
  {
    id: "al-1",
    kind: "ACTIVITY",
    severity: "HIGH",
    title: "High mosquito activity detected",
    location: "Kicukiro - Sector 3",
    message: "Elevated vector concentration reported by trap #MSQ-012",
    createdAt: hoursAgo(2),
    deviceId: "MSQ-012",
    acknowledged: false,
  },
  {
    id: "al-2",
    kind: "DEVICE_OFFLINE",
    severity: "MEDIUM",
    title: "Device offline",
    location: "Device #MSQ-021 (Nyabihu)",
    message: "Battery critical / connection interrupted",
    createdAt: hoursAgo(4),
    deviceId: "MSQ-021",
    acknowledged: false,
  },
  {
    id: "al-3",
    kind: "RISK_AREA",
    severity: "HIGH",
    title: "High risk area detected",
    location: "Nyarugenge - Center",
    message: "Multiple active traps exceeding threshold values",
    createdAt: hoursAgo(6),
    acknowledged: false,
  },
  {
    id: "al-4",
    kind: "ACTIVITY",
    severity: "LOW",
    title: "Low mosquito activity",
    location: "Gasyata - South",
    message: "Normal conditions restored across residential sector",
    createdAt: hoursAgo(8),
    acknowledged: false,
  },
  {
    id: "al-5",
    kind: "DEVICE_ONLINE",
    severity: "INFO",
    title: "Device back online",
    location: "Device #MSQ-017 (Rubavu)",
    message: "Telemetry heartbeat resumed, solar charge nominal",
    createdAt: hoursAgo(12),
    deviceId: "MSQ-017",
    acknowledged: false,
  },
  {
    id: "al-6",
    kind: "RISK_AREA",
    severity: "HIGH",
    title: "High risk area detected",
    location: "Bugesera - Nyamata",
    message: "Capture counts above 7-day baseline for 3 consecutive days",
    createdAt: hoursAgo(20),
    acknowledged: false,
  },
  {
    id: "al-7",
    kind: "DEVICE_OFFLINE",
    severity: "MEDIUM",
    title: "Device offline",
    location: "Device #MSQ-004 (Rubavu)",
    message: "No heartbeat received for over 12 hours",
    createdAt: hoursAgo(26),
    deviceId: "MSQ-004",
    acknowledged: false,
  },
  {
    id: "al-8",
    kind: "ACTIVITY",
    severity: "MEDIUM",
    title: "Rising mosquito activity",
    location: "Gasabo - Remera",
    message: "Daily captures up 30% versus last week",
    createdAt: hoursAgo(30),
    acknowledged: false,
  },
];

const REPORT_TYPES: Report["type"][] = [
  "MOSQUITO_ACTIVITY",
  "RISK_ASSESSMENT",
  "CAPTURE",
  "SYSTEM_PERFORMANCE",
];
const REPORT_AREAS = [12, 8, 15, 1, 10, 9, 12, 4];

export const reports: Report[] = Array.from({ length: 24 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 8, 29 - i, 8));
  return {
    id: `rep-${i + 1}`,
    date: date.toISOString(),
    type: i === 4 ? "MOSQUITO_ACTIVITY" : REPORT_TYPES[i % 4],
    areas: REPORT_AREAS[i % REPORT_AREAS.length],
    status: "COMPLETED",
  };
});

export const users: User[] = [
  { id: "u-1", name: "Admin Authority", email: "admin@rha.gov.rw", role: "ADMIN", active: true, lastLoginAt: "2026-09-29T07:00:00Z" },
  { id: "u-2", name: "Dr. Jean Bosco", email: "jean@rha.gov.rw", role: "AUTHORITY_ADMIN", active: true, lastLoginAt: "2026-09-28T07:00:00Z" },
  { id: "u-3", name: "Aline Mukamana", email: "aline@rha.gov.rw", role: "AUTHORITY_VIEWER", active: true, lastLoginAt: "2026-09-27T07:00:00Z" },
  { id: "u-4", name: "Samuel Niyoncima", email: "samuel@rha.gov.rw", role: "AUTHORITY_ADMIN", active: true, lastLoginAt: "2026-09-26T07:00:00Z" },
  { id: "u-5", name: "Claire Uwimana", email: "claire@rha.gov.rw", role: "AUTHORITY_VIEWER", active: false, lastLoginAt: "2026-09-20T07:00:00Z" },
  { id: "u-6", name: "Eric Habimana", email: "eric@rha.gov.rw", role: "AUTHORITY_VIEWER", active: true, lastLoginAt: "2026-09-25T07:00:00Z" },
  { id: "u-7", name: "Diane Ingabire", email: "diane@rha.gov.rw", role: "AUTHORITY_ADMIN", active: true, lastLoginAt: "2026-09-24T07:00:00Z" },
  { id: "u-8", name: "Patrick Mugisha", email: "patrick@rha.gov.rw", role: "AUTHORITY_VIEWER", active: true, lastLoginAt: "2026-09-23T07:00:00Z" },
  { id: "u-9", name: "Grace Uwase", email: "grace@rha.gov.rw", role: "AUTHORITY_VIEWER", active: false, lastLoginAt: "2026-09-15T07:00:00Z" },
  { id: "u-10", name: "Olivier Nkurunziza", email: "olivier@rha.gov.rw", role: "AUTHORITY_VIEWER", active: true, lastLoginAt: "2026-09-22T07:00:00Z" },
  { id: "u-11", name: "Josiane Mukeshimana", email: "josiane@rha.gov.rw", role: "AUTHORITY_ADMIN", active: true, lastLoginAt: "2026-09-21T07:00:00Z" },
  { id: "u-12", name: "Thierry Bizimana", email: "thierry@rha.gov.rw", role: "AUTHORITY_VIEWER", active: true, lastLoginAt: "2026-09-19T07:00:00Z" },
];

export const trend: TrendPoint[] = [
  { date: "2026-09-24", total: 92, highRisk: 44 },
  { date: "2026-09-25", total: 128, highRisk: 52 },
  { date: "2026-09-26", total: 84, highRisk: 58 },
  { date: "2026-09-27", total: 151, highRisk: 63 },
  { date: "2026-09-28", total: 238, highRisk: 70 },
  { date: "2026-09-29", total: 160, highRisk: 66 },
];

export const summary: DashboardSummary = {
  periodStart: "2026-09-23",
  periodEnd: "2026-09-29",
  totalMosquitoes: { value: 2487, change: 0.16 },
  highRiskAreas: { value: 3, change: 0.4 },
  activeDevices: { value: 24, total: 26, change: -0.04 },
  captures: { value: 12842, change: 0.22 },
  uptimePct: { value: 98.5, change: 0.001 },
  totalReports: { value: 247, change: 0.18 },
};

// ---- Analytics: 60 days of AI-confirmed captures per area -------------------

// [7-day trend vs. the month before, Anopheles share]
const AREA_PROFILE: Record<string, [number, number]> = {
  "Kicukiro - Sector 3": [0.45, 0.46],
  "Nyarugenge - Center": [0.2, 0.31],
  "Gasabo - Remera": [0.3, 0.22],
  "Muhanga - Downtown": [0.02, 0.18],
  "Rubavu - Gisenyi": [-0.15, 0.12],
  "Gicumbi - Byumba": [0.04, 0.25],
  "Bugesera - Nyamata": [0.35, 0.52],
  "Musanze - Muhoza": [-0.35, 0.1],
  "Rwamagana - Kigabiro": [0, 0.2],
  "Nyabihu - Mukamira": [-0.02, 0.08],
  "Nyanza - Busasamana": [-0.1, 0.16],
  "Gasabo - Kimironko": [0.05, 0.15],
};

const ANALYTICS_DAYS = 60;
const LAST_DAY = Date.UTC(2026, 8, 29);
const DAY = 24 * 60 * 60 * 1000;
const noise = (seed: number) => ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1;
const captureDevices = (site: string) => devices.filter((d) => d.area === site && d.type !== "WEATHER_SENSOR");

export const areaDays: AreaDay[] = areas.flatMap((area, ai) => {
  const [trend, anopheles] = AREA_PROFILE[area.name] ?? [0, 0.2];
  const installed = captureDevices(area.site);
  const base = area.mosquitoCount / 7 / (1 + Math.max(trend, 0));

  return Array.from({ length: ANALYTICS_DAYS }, (_, t) => {
    const date = new Date(LAST_DAY - (ANALYTICS_DAYS - 1 - t) * DAY).toISOString().slice(0, 10);
    // Offline devices stop reporting for their last 2 days; Nyanza lost power Sep 20-22.
    const reporting = installed.filter((d) => d.status !== "OFFLINE" || t < ANALYTICS_DAYS - 2).length;
    const outage = area.site === "Nyanza" && date >= "2026-09-20" && date <= "2026-09-22";
    if (reporting === 0 || outage) {
      return { area: area.name, date, captures: null, bySpecies: null, reportingDevices: 0, totalDevices: installed.length };
    }
    const ramp = 1 + trend * Math.min(1, Math.max(0, (t - 49) / 6));
    const weekly = 1 + 0.12 * Math.sin((t + ai) / 1.1);
    const full = base * ramp * weekly * (0.85 + 0.3 * noise(ai * 100 + t));
    const captures = Math.round((full * reporting) / Math.max(installed.length, 1));
    const an = Math.round(captures * anopheles);
    const aedes = Math.round(captures * 0.08);
    const other = Math.round(captures * 0.06);
    return {
      area: area.name,
      date,
      captures,
      bySpecies: { ANOPHELES: an, CULEX: captures - an - aedes - other, AEDES: aedes, OTHER: other },
      reportingDevices: reporting,
      totalDevices: installed.length,
    };
  });
});

/** Share of captures by hour of day (Africa/Kigali), from image timestamps. */
export const hourlyShare: number[] = [
  3.1, 2.6, 2.2, 2.4, 3.6, 4.4, 3.0, 1.2, 0.6, 0.4, 0.3, 0.3,
  0.3, 0.3, 0.4, 0.6, 1.0, 2.4, 5.6, 9.8, 12.4, 11.6, 9.5, 7.0,
];
