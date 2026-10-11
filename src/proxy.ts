import { NextResponse, type NextRequest } from "next/server";
import { API_URL, SESSION, authEnabled, clearedSessionCookies, secondsLeft, sessionCookies, type TokenPair } from "@/lib/session-cookies";

const PUBLIC = ["/login"];

/**
 * Optimistic session check before every page: signed-out visitors go to the
 * login page, an expiring access token is renewed with the refresh token, and
 * people holding a temporary password are sent to change it first. The backend
 * still authorises every call.
 */
export async function proxy(request: NextRequest) {
  if (!authEnabled) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const access = request.cookies.get(SESSION.access)?.value;
  const refresh = request.cookies.get(SESSION.refresh)?.value;

  if (PUBLIC.includes(pathname)) return NextResponse.next();

  const toLogin = () => {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    for (const c of clearedSessionCookies()) res.cookies.set(c);
    return res;
  };
  if (!refresh) return toLogin();

  let res: NextResponse | null = null;
  if (secondsLeft(access) < 30) {
    const renewed = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }).catch(() => null);
    if (!renewed?.ok) return toLogin();
    const tokens = (await renewed.json()) as TokenPair;
    const writes = sessionCookies(tokens);
    // Pass the new tokens to this request's server components as well as the browser.
    for (const c of writes) request.cookies.set(c.name, c.value);
    res = NextResponse.next({ request });
    for (const c of writes) res.cookies.set(c);
  }

  const mustChange = request.cookies.get(SESSION.mustChange)?.value === "1";
  if (mustChange && pathname !== "/change-password") {
    const redirect = NextResponse.redirect(new URL("/change-password", request.url));
    if (res) for (const c of res.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }
  return res ?? NextResponse.next();
}

export const config = {
  // Pages only: skip Next internals, static assets and the MapLibre worker.
  matcher: ["/((?!_next/|maplibre/|favicon.ico|icon.svg|.*\\.(?:png|jpg|svg|webp|js|css|map)$).*)"],
};
