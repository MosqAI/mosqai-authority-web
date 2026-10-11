import { redirect } from "next/navigation";
import { cache } from "react";
import { backend, backendEnabled } from "./backend";
import type { UserRole } from "./types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: string;
}

/** Sample-data mode has no accounts: the dashboard behaves as a super admin. */
const DEMO_ADMIN: SessionUser = { id: "demo", name: "Admin Authority", email: "admin@rha.gov.rw", role: "ADMIN", language: "en" };

/** The signed-in person, fetched once per request. */
export const getSessionUser = cache(async (): Promise<SessionUser> => {
  if (!backendEnabled) return DEMO_ADMIN;
  const me = await backend<Omit<SessionUser, "role"> & { role: string }>("/auth/me");
  // Device owners use the mobile app; the dashboard is for authority staff.
  if (me.role === "OWNER") redirect("/login?error=owner");
  return me as SessionUser;
});

/** What each role may do in the dashboard. The backend enforces the same rules. */
export const can = {
  manageUsers: (role: UserRole) => role === "ADMIN",
  registerDevices: (role: UserRole) => role === "ADMIN" || role === "AUTHORITY_ADMIN",
};

/** For pages limited to some roles: anyone else lands on the dashboard. */
export async function requireRole(check: (role: UserRole) => boolean) {
  const user = await getSessionUser();
  if (!check(user.role)) redirect("/");
  return user;
}
