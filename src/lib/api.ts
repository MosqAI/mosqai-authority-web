// Data access for the authority dashboard. Every page reads through here; the
// signatures are the contract the pages rely on. With MOSQAI_API_URL set, data
// comes live from mosqai-backend; without it, from the built-in sample data
// (tests, offline demos).
import { backend, backendEnabled as live } from "./backend";
import * as db from "./mock-data";
import type { Alert, Area, AreaDay, DashboardSummary, Device, DeviceSync, Report, TrendPoint, User } from "./types";

export async function getSummary(): Promise<DashboardSummary> {
  if (live) return backend("/analytics/summary");
  return db.summary;
}

export async function getTrend(): Promise<TrendPoint[]> {
  if (live) return backend("/analytics/trend");
  return db.trend;
}

export async function getDevices(): Promise<Device[]> {
  if (live) return backend("/devices");
  return db.devices;
}

export async function getDevice(id: string): Promise<Device | undefined> {
  if (live) return backend<Device>(`/devices/${encodeURIComponent(id)}`).catch(() => undefined);
  return db.devices.find((d) => d.id === id);
}

export interface RegisterDeviceInput {
  type: Device["type"];
  areaName: string;
  sector: string;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Registers a device and returns its one-time pairing code (backend: POST /v1/devices).
 * Against the fixtures it lives in server memory until the dev server restarts.
 */
export async function registerDevice(input: RegisterDeviceInput): Promise<{ device: Device; pairingCode: string }> {
  if (live) return backend("/devices", { method: "POST", json: input });
  const area = db.areas.find((a) => a.name === input.areaName);
  if (!area) throw new Error("Unknown area");
  const next = Math.max(0, ...db.devices.map((d) => Number(d.id.slice(4)))) + 1;
  const device: Device = {
    id: `MSQ-${String(next).padStart(3, "0")}`,
    type: input.type,
    area: area.site,
    sector: input.sector,
    status: "OFFLINE",
    batteryPct: null,
    lastSeenAt: null,
    installedAt: new Date().toISOString(),
    nextMaintenanceAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    lat: area.lat,
    lng: area.lng,
  };
  db.devices.push(device);
  const random = crypto.getRandomValues(new Uint32Array(6));
  const pairingCode = `PAIR-${[...random].map((n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join("")}`;
  return { device, pairingCode };
}

export async function getDeviceSyncs(id: string): Promise<DeviceSync[]> {
  if (live) return backend(`/devices/${encodeURIComponent(id)}/syncs`);
  // A device that has never reported has no sync history.
  return db.devices.some((d) => d.id === id && d.lastSeenAt) ? db.deviceSyncs : [];
}

export async function getAreas(): Promise<Area[]> {
  if (live) return backend("/areas");
  return [...db.areas].sort((a, b) => b.mosquitoCount - a.mosquitoCount);
}

export async function getAlerts(): Promise<Alert[]> {
  if (live) return backend("/alerts");
  return db.alerts;
}

export async function getReports(): Promise<Report[]> {
  if (live) return backend("/reports");
  return db.reports;
}

export async function getUsers(): Promise<User[]> {
  if (live) return backend("/users");
  return db.users;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: User["role"];
}

/**
 * Result of creating an account or resetting a password. The temporary password
 * comes back only when the email could not be sent (no SMTP configured).
 */
export interface CredentialsResult {
  user: User;
  emailed: boolean;
  temporaryPassword?: string;
}

const tempPassword = () => {
  const random = crypto.getRandomValues(new Uint32Array(12));
  return [...random].map((n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join("");
};

/** Creates a staff account and emails its temporary password (backend: POST /users). */
export async function createUser(input: CreateUserInput): Promise<CredentialsResult> {
  if (live) return backend("/users", { method: "POST", json: input });
  if (db.users.some((u) => u.email === input.email.toLowerCase())) throw new Error("An account with this email already exists");
  const user: User = { id: `u-${db.users.length + 1}`, ...input, email: input.email.toLowerCase(), active: true, lastLoginAt: null };
  db.users.push(user);
  return { user, emailed: false, temporaryPassword: tempPassword() };
}

/** Changes a staff member's role or access (backend: PATCH /users/:id). */
export async function updateUser(id: string, patch: { role?: User["role"]; active?: boolean }): Promise<User> {
  if (live) return backend(`/users/${encodeURIComponent(id)}`, { method: "PATCH", json: patch });
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  Object.assign(user, patch);
  return user;
}

/** Issues and emails a new temporary password (backend: POST /users/:id/reset-password). */
export async function resetUserPassword(id: string): Promise<CredentialsResult> {
  if (live) return backend(`/users/${encodeURIComponent(id)}/reset-password`, { method: "POST" });
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return { user, emailed: false, temporaryPassword: tempPassword() };
}

/** Daily AI-confirmed captures per area (backend: GET /analytics/area-days). */
export async function getAreaDays(): Promise<AreaDay[]> {
  if (live) return backend("/analytics/area-days?days=60");
  return db.areaDays;
}

/** Share of captures per hour of day, 24 values (backend: GET /analytics/hourly). */
export async function getHourlyShare(): Promise<number[]> {
  if (live) return backend("/analytics/hourly");
  return db.hourlyShare;
}
