"use client";

import { Check, Copy, KeyRound, MailCheck, Plus, UserCheck, UserX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { createUserAction, resetPasswordAction, updateUserAction, type UserActionResult } from "@/app/(console)/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchField, Select } from "@/components/ui/fields";
import { Pagination, paginate } from "@/components/ui/pagination";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { User, UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["AUTHORITY_VIEWER", "AUTHORITY_ADMIN", "ADMIN"];
const inputClass =
  "w-full rounded-lg border border-glass-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-accent/30 focus:outline-none";

type Outcome = { kind: "created" | "reset"; user: User; emailed: boolean; temporaryPassword?: string };

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Shows where the credentials went; the password itself only when no email could be sent. */
function OutcomePanel({ outcome, onDone }: { outcome: Outcome; onDone: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const u = t.users;
  return (
    <div className="flex flex-col gap-4 p-6 pt-2">
      {outcome.emailed ? (
        <p className="flex items-start gap-2.5 text-sm text-ink-soft">
          <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
          {fmt(outcome.kind === "created" ? u.sentBody : u.resetSentBody, { email: outcome.user.email })}
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-soft">{fmt(u.notSentBody, { name: outcome.user.name })}</p>
          <div className="flex items-center gap-3 rounded-lg border border-glass-border bg-glass-strong p-4">
            <KeyRound className="size-4 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-ink-faint">{u.temporaryPassword}</p>
              <p className="font-mono text-lg tracking-wider text-ink">{outcome.temporaryPassword}</p>
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(outcome.temporaryPassword ?? "").catch(() => {});
                setCopied(true);
              }}
            >
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? t.devices.copied : t.devices.copy}
            </Button>
          </div>
        </>
      )}
      <div className="flex justify-end">
        <Button onClick={onDone}>{t.devices.done}</Button>
      </div>
    </div>
  );
}

export function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const { t, f } = useI18n();
  const u = t.users;
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", email: "", role: "AUTHORITY_VIEWER" as UserRole });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((x) => q === "" || [x.name, x.email, t.enums.role[x.role]].some((v) => v.toLowerCase().includes(q)));
  }, [users, query, t]);
  const { rows, current, pageCount } = paginate(filtered, page);

  const errorText = (r: UserActionResult) => (r.ok ? null : r.error === "exists" ? u.exists : u.failed);

  const openAdd = () => {
    setForm({ name: "", email: "", role: "AUTHORITY_VIEWER" });
    setOutcome(null);
    setError(null);
    dialog.current?.showModal();
  };
  const closeDialog = () => {
    dialog.current?.close();
    setOutcome(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await createUserAction(form);
      if (r.ok && r.user) {
        setOutcome({ kind: "created", user: r.user, emailed: Boolean(r.emailed), temporaryPassword: r.temporaryPassword });
        router.refresh();
      } else setError(errorText(r));
    });
  };

  const reset = (user: User) => {
    if (!confirm(fmt(u.resetConfirm, { name: user.name }))) return;
    startTransition(async () => {
      const r = await resetPasswordAction(user.id);
      if (r.ok && r.user) {
        setOutcome({ kind: "reset", user: r.user, emailed: Boolean(r.emailed), temporaryPassword: r.temporaryPassword });
        dialog.current?.showModal();
      } else alert(errorText(r));
    });
  };

  const toggleAccess = (user: User) => {
    if (user.active && !confirm(fmt(u.deactivateConfirm, { name: user.name }))) return;
    startTransition(async () => {
      const r = await updateUserAction(user.id, { active: !user.active });
      if (!r.ok) alert(errorText(r));
      router.refresh();
    });
  };

  const changeRole = (user: User, role: UserRole) =>
    startTransition(async () => {
      const r = await updateUserAction(user.id, { role });
      if (!r.ok) alert(errorText(r));
      router.refresh();
    });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <SearchField
          label={u.searchPlaceholder}
          placeholder={u.searchPlaceholder}
          className="w-full sm:w-72"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <Button onClick={openAdd}>
          <Plus className="size-3.5" aria-hidden /> {u.add}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs text-ink-faint">
            <tr className="border-y border-glass-border">
              <th className="px-6 py-3 font-normal">{u.name}</th>
              <th className="px-6 py-3 font-normal">{u.role}</th>
              <th className="px-6 py-3 font-normal">{u.status}</th>
              <th className="px-6 py-3 font-normal">{u.lastLogin}</th>
              <th className="px-6 py-3 text-right font-normal">{u.actions}</th>
            </tr>
          </thead>
          <tbody className={pending ? "opacity-60" : undefined}>
            {rows.map((x) => {
              const self = x.id === currentUserId;
              return (
                <tr key={x.id} className="border-b border-glass-border/60 last:border-0">
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lavender text-[11px] font-semibold text-accent-strong">
                        {initials(x.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-ink">
                          {x.name} {self && <span className="text-xs text-ink-faint">· {u.you}</span>}
                        </span>
                        <span className="block text-xs text-ink-faint">{x.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {self ? (
                      <span className="text-ink-soft">{t.enums.role[x.role]}</span>
                    ) : (
                      <Select label={fmt(u.changeRole, { name: x.name })} value={x.role} onChange={(e) => changeRole(x, e.target.value as UserRole)} className="w-44">
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {t.enums.role[r]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Badge tone={x.active ? "success" : "neutral"}>{x.active ? u.active : u.inactive}</Badge>
                  </td>
                  <td className="px-6 py-3 text-ink-soft">{x.lastLoginAt ? f.date(x.lastLoginAt) : u.never}</td>
                  <td className="px-6 py-3">
                    {!self && (
                      <div className="flex justify-end gap-1 text-ink-faint">
                        <button
                          type="button"
                          onClick={() => reset(x)}
                          title={u.reset}
                          aria-label={`${u.reset}: ${x.name}`}
                          className="rounded-md p-1.5 transition hover:bg-accent-soft/60 hover:text-ink"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAccess(x)}
                          title={x.active ? u.deactivate : u.activate}
                          aria-label={`${x.active ? u.deactivate : u.activate}: ${x.name}`}
                          className="rounded-md p-1.5 transition hover:bg-accent-soft/60 hover:text-ink"
                        >
                          {x.active ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink-soft">
                  {fmt(u.empty, { query })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={current} pageCount={pageCount} total={filtered.length} onChange={setPage} />

      <dialog
        ref={dialog}
        aria-labelledby="user-dialog-title"
        onClose={() => setOutcome(null)}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-glass-border bg-white p-0 text-ink shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <h2 id="user-dialog-title" className="text-lg">
            {!outcome ? u.addTitle : outcome.emailed ? (outcome.kind === "created" ? u.sentTitle : u.resetSentTitle) : u.notSentTitle}
          </h2>
          <button type="button" onClick={closeDialog} aria-label={t.devices.cancel} className="rounded-md p-1 text-ink-faint hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        {outcome ? (
          <OutcomePanel outcome={outcome} onDone={closeDialog} />
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 p-6 pt-2">
            <p className="text-sm text-ink-soft">{u.addHint}</p>
            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              {u.name}
              <input className={inputClass} required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              {u.email}
              <input className={inputClass} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
              {u.role}
              <Select label={u.role} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full">
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t.enums.role[r]}
                  </option>
                ))}
              </Select>
              <span className="text-[11px] leading-relaxed text-ink-faint">{u.roleHelp}</span>
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={closeDialog}>
                {t.devices.cancel}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? u.creating : u.create}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </Card>
  );
}
