// Session cookies shared by the proxy (token refresh) and server actions
// (sign-in / sign-out). Tokens live only in httpOnly cookies: page scripts
// never see them.

export const SESSION = {
  access: "mosqai-at",
  refresh: "mosqai-rt",
  /** Set while the person still has to replace an admin-issued temporary password. */
  mustChange: "mosqai-pwc",
} as const;

export const API_URL = process.env.MOSQAI_API_URL?.replace(/\/$/, "");

/** With no backend configured the dashboard runs on sample data and needs no sign-in. */
export const authEnabled = Boolean(API_URL);

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime, seconds. */
  expiresIn: number;
  user: { mustChangePassword?: boolean };
}

const base = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

/** Cookie writes for a fresh token pair, usable with both `cookies()` and NextResponse cookies. */
export function sessionCookies(tokens: TokenPair) {
  return [
    { name: SESSION.access, value: tokens.accessToken, ...base, maxAge: tokens.expiresIn },
    { name: SESSION.refresh, value: tokens.refreshToken, ...base, maxAge: 30 * 86400 },
    tokens.user.mustChangePassword
      ? { name: SESSION.mustChange, value: "1", ...base, maxAge: 30 * 86400 }
      : { name: SESSION.mustChange, value: "", ...base, maxAge: 0 },
  ];
}

export const clearedSessionCookies = () =>
  [SESSION.access, SESSION.refresh, SESSION.mustChange].map((name) => ({ name, value: "", ...base, maxAge: 0 }));

/** Seconds until the JWT expires (no signature check: the backend verifies every call). */
export function secondsLeft(jwt: string | undefined): number {
  if (!jwt) return 0;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return (payload.exp ?? 0) - Date.now() / 1000;
  } catch {
    return 0;
  }
}
