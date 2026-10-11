"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_URL, SESSION, authEnabled, clearedSessionCookies, sessionCookies, type TokenPair } from "@/lib/session-cookies";

export type AuthFormState = { error?: "invalid" | "owner" | "unavailable" | "weak" | "mismatch" | "current" | "same" } | undefined;

const loginSchema = z.object({ email: z.email(), password: z.string().min(1), next: z.string().optional() });

/** Only same-site paths are followed after sign-in. */
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/");

export async function signIn(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  if (!authEnabled) redirect("/");
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    cache: "no-store",
  }).catch(() => null);
  if (!res) return { error: "unavailable" };
  if (res.status === 401 || res.status === 400) return { error: "invalid" };
  if (!res.ok) return { error: "unavailable" };
  const tokens = (await res.json()) as TokenPair & { user: { role: string } };
  // Device owners have their own app; their sessions are not kept here.
  if (tokens.user.role === "OWNER") {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ refreshToken: tokens.refreshToken }) }).catch(() => null);
    return { error: "owner" };
  }
  const store = await cookies();
  for (const c of sessionCookies(tokens)) store.set(c);
  redirect(tokens.user.mustChangePassword ? "/change-password" : safeNext(parsed.data.next));
}

export async function signOut() {
  const store = await cookies();
  const refresh = store.get(SESSION.refresh)?.value;
  if (authEnabled && refresh) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    }).catch(() => null);
  }
  for (const c of clearedSessionCookies()) store.set(c);
  redirect("/login");
}

const passwordSchema = z.object({ current: z.string().min(1), next: z.string(), confirm: z.string() });

export async function changePassword(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  if (!authEnabled) redirect("/");
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "invalid" };
  const { current, next, confirm } = parsed.data;
  if (next.length < 10) return { error: "weak" };
  if (next !== confirm) return { error: "mismatch" };
  if (next === current) return { error: "same" };
  const store = await cookies();
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${store.get(SESSION.access)?.value ?? ""}` },
    body: JSON.stringify({ currentPassword: current, newPassword: next }),
    cache: "no-store",
  }).catch(() => null);
  if (!res) return { error: "unavailable" };
  if (res.status === 401) return { error: "current" };
  if (!res.ok) return { error: "unavailable" };
  for (const c of sessionCookies((await res.json()) as TokenPair)) store.set(c);
  redirect("/");
}
