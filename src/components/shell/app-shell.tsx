"use client";

import {
  Bell,
  ChartColumn,
  ChevronDown,
  Cpu,
  FileText,
  LayoutGrid,
  LogOut,
  Map,
  Menu,
  Plus,
  Settings,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { SearchField } from "@/components/ui/fields";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { Dict } from "@/i18n/dictionaries/en";
import { signOut } from "@/app/auth/actions";
import type { SessionUser } from "@/lib/session";
import { LanguageSwitcher } from "./language-switcher";

const NAV: { href: string; key: keyof Dict["nav"]; icon: LucideIcon; adminOnly?: boolean }[] = [
  { href: "/", key: "dashboard", icon: LayoutGrid },
  { href: "/map", key: "map", icon: Map },
  { href: "/analytics", key: "analytics", icon: ChartColumn },
  { href: "/reports", key: "reports", icon: FileText },
  { href: "/alerts", key: "alerts", icon: Bell },
  { href: "/users", key: "users", icon: UserCog, adminOnly: true },
  { href: "/devices", key: "devices", icon: Cpu },
  { href: "/settings", key: "settings", icon: Settings },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

function Sidebar({
  user,
  openAlerts,
  onNavigate,
  solid = false,
}: {
  user: SessionUser;
  openAlerts: number;
  onNavigate?: () => void;
  /** Opaque panel for the mobile drawer, where glass would let page text show through. */
  solid?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div
      className={`flex h-full flex-col p-4 ${
        solid ? "overflow-y-auto rounded-[1.5rem] border border-white bg-white shadow-2xl" : "glass"
      }`}
    >
      <Link href="/" onClick={onNavigate} className="mb-7 flex items-center gap-2.5 px-2 pt-2">
        <Logo />
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV.filter((n) => !n.adminOnly || user.role === "ADMIN").map(({ href, key, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition ${
                active
                  ? "bg-accent-soft font-semibold text-accent-strong"
                  : "font-medium text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
              }`}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              <span className="flex-1">{t.nav[key]}</span>
              {/* A dot, not a number: open alerts are signalled, counted on the alerts page */}
              {href === "/alerts" && openAlerts > 0 && <span className="size-2 rounded-full bg-rose-500" aria-hidden />}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-brand-deep p-4 text-white">
        <LogoMark variant="white" className="absolute -right-5 -bottom-6 h-28 w-24 opacity-15" />
        <p className="relative font-display text-sm font-bold">{t.nav.promoTitle}</p>
        <p className="relative mt-1 text-xs text-white/75">{t.nav.promoText}</p>
        <Link
          href="/analytics"
          onClick={onNavigate}
          className="relative mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-semibold text-brand-deep transition hover:bg-lavender"
        >
          {t.nav.promoCta}
        </Link>
      </div>
    </div>
  );
}

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function TopBar({ user, openAlerts, onMenu }: { user: SessionUser; openAlerts: number; onMenu: () => void }) {
  const { t } = useI18n();
  return (
    <header className="flex shrink-0 items-center gap-3 px-4 pt-4 sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="flex size-9 items-center justify-center rounded-lg border border-glass-border bg-white text-ink-soft lg:hidden"
        aria-label={t.common.openMenu}
      >
        <Menu className="size-5" />
      </button>
      {/* Global search lands on the device list, the most common lookup. */}
      <form action="/devices" className="w-full max-w-md">
        <SearchField name="q" label={t.common.search} placeholder={t.common.search} shortcut="⌘ K" />
      </form>
      <div className="ml-auto flex items-center gap-2.5">
        {user.role !== "AUTHORITY_VIEWER" && (
          <Link
            href="/devices?add=1"
          className="hidden size-9 items-center justify-center rounded-lg bg-accent text-white transition hover:bg-accent-strong sm:flex"
            aria-label={t.devices.add}
          >
            <Plus className="size-5" />
          </Link>
        )}
        <LanguageSwitcher />
        <Link
          href="/alerts"
          className="relative flex size-9 items-center justify-center rounded-lg border border-glass-border bg-white text-ink-soft transition hover:text-ink"
          aria-label={fmt(t.common.notifications, { count: openAlerts })}
        >
          <Bell className="size-5" />
          {openAlerts > 0 && <span className="absolute top-2.5 right-3 size-2 rounded-full bg-rose-500 ring-2 ring-white" />}
        </Link>
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-lg border border-glass-border bg-white py-1 pr-3 pl-1 [&::-webkit-details-marker]:hidden">
            <span className="flex size-8 items-center justify-center rounded-md bg-lavender text-xs font-semibold text-accent-strong">{initials(user.name)}</span>
            <span className="hidden md:block">
              <span className="block text-sm leading-tight font-medium text-ink">{user.name}</span>
              <span className="block text-[11px] text-ink-faint">{t.enums.role[user.role]}</span>
            </span>
            <ChevronDown className="size-4 text-ink-faint transition group-open:rotate-180" aria-hidden />
          </summary>
          <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-glass-border bg-white p-1.5 shadow-[0_12px_32px_-16px_rgb(36_21_68/0.35)]">
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-faint">{user.email}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-accent-soft/60 hover:text-ink">
                <LogOut className="size-4" aria-hidden /> {t.auth.signOut}
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}

export function AppShell({ user, openAlerts, children }: { user: SessionUser; openAlerts: number; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="flex h-full gap-0 lg:p-4 lg:pr-0">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar user={user} openAlerts={openAlerts} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Full-screen scrim so nothing from the page shows through or around the drawer. */}
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
            aria-label={t.common.closeMenu}
          />
          <div className="relative h-full w-72 max-w-[85vw] p-3">
            <Sidebar user={user} openAlerts={openAlerts} onNavigate={() => setMenuOpen(false)} solid />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t.common.closeMenu}
            className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-lg bg-white text-ink shadow-lg"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} openAlerts={openAlerts} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
