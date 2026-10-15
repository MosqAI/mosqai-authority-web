import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL, SESSION, authEnabled } from "./session-cookies";

// Server-side client for mosqai-backend. Every call is made as the signed-in
// person, with the access token from their httpOnly session cookie, so the
// backend applies that person's role. The proxy renews the token before pages
// render; a 401 here means the session is gone and the person signs in again.

/** True when the dashboard reads live data instead of the built-in samples. */
export const backendEnabled = authEnabled;

export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** JSON request to the backend as the current user. */
export async function backend<T>(path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
  const token = (await cookies()).get(SESSION.access)?.value;
  if (!token) redirect("/login");
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      authorization: `Bearer ${token}`,
      ...(init.json !== undefined && { "content-type": "application/json" }),
    },
    body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
    cache: "no-store",
  });
  if (res.status === 401) redirect("/login");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    throw new BackendError(res.status, message ?? `${init.method ?? "GET"} ${path} failed (${res.status})`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
