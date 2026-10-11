export type DeviceType = "MOSQUITO_TRAP" | "CAMERA_TRAP" | "WEATHER_SENSOR";
export type DeviceStatus = "ONLINE" | "OFFLINE" | "WARNING";
export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";
export type AlertSeverity = "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type AlertKind = "ACTIVITY" | "DEVICE_OFFLINE" | "RISK_AREA" | "DEVICE_ONLINE";
export type UserRole = "ADMIN" | "AUTHORITY_ADMIN" | "AUTHORITY_VIEWER";
export type ReportType = "MOSQUITO_ACTIVITY" | "RISK_ASSESSMENT" | "CAPTURE" | "SYSTEM_PERFORMANCE";
export type ReportStatus = "COMPLETED" | "PROCESSING";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Device extends LatLng {
  id: string;
  type: DeviceType;
  area: string;
  sector: string;
  status: DeviceStatus;
  /** null when the device is not reporting: unknown, not zero. */
  batteryPct: number | null;
  /** null until the device sends its first heartbeat. */
  lastSeenAt: string | null;
  installedAt: string;
  nextMaintenanceAt: string;
}

export interface DeviceSync {
  at: string;
  captures: number;
}

export interface Area extends LatLng {
  name: string;
  /** Device site the area is monitored by (matches Device.area). */
  site: string;
  district: string;
  mosquitoCount: number;
  risk: RiskLevel;
}

export interface Alert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  location: string;
  message: string;
  createdAt: string;
  deviceId?: string;
  acknowledged: boolean;
}

export interface Report {
  id: string;
  date: string;
  type: ReportType;
  areas: number;
  status: ReportStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  /** null until the person first signs in. */
  lastLoginAt: string | null;
}

export interface TrendPoint {
  date: string;
  total: number;
  highRisk: number;
}

export type Species = "ANOPHELES" | "CULEX" | "AEDES" | "OTHER";

/** One area-day of AI-confirmed captures. `null` counts mean NO_DATA, never zero. */
export interface AreaDay {
  area: string;
  date: string;
  captures: number | null;
  bySpecies: Record<Species, number> | null;
  /** Devices that reported that day / devices installed in the area. */
  reportingDevices: number;
  totalDevices: number;
}

export interface Kpi {
  value: number;
  /** Fractional change vs. the previous period, e.g. 0.16 for +16%; null when there is nothing to compare with. */
  change: number | null;
}

export interface DashboardSummary {
  periodStart: string;
  periodEnd: string;
  totalMosquitoes: Kpi;
  highRiskAreas: Kpi;
  activeDevices: Kpi & { total: number };
  captures: Kpi;
  uptimePct: Kpi;
  totalReports: Kpi;
}
