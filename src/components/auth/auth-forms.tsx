"use client";

import { useActionState } from "react";
import { changePassword, signIn, type AuthFormState } from "@/app/auth/actions";
import { useI18n } from "@/i18n/client";

const inputClass =
  "w-full rounded-lg border border-glass-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:outline-none";
const submitClass =
  "mt-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60";

function Field({ label, ...props }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-ink-soft">
      {label}
      <input className={inputClass} {...props} />
    </label>
  );
}

export function SignInForm({ next, initialError }: { next?: string; initialError?: "owner" }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, initialError ? { error: initialError } : undefined);
  const message = state?.error && { invalid: t.auth.invalid, owner: t.auth.owner, unavailable: t.auth.unavailable }[state.error as "invalid" | "owner" | "unavailable"];
  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={t.auth.email} name="email" type="email" autoComplete="username" required autoFocus />
      <Field label={t.auth.password} name="password" type="password" autoComplete="current-password" required />
      {message && (
        <p role="alert" className="text-sm text-rose-600">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? t.auth.signingIn : t.auth.submit}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthFormState, FormData>(changePassword, undefined);
  const a = t.auth;
  const message =
    state?.error &&
    ({ weak: a.weak, mismatch: a.mismatch, current: a.currentWrong, same: a.same, invalid: a.weak, unavailable: a.unavailable, owner: a.owner } as const)[state.error];
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label={a.current} name="current" type="password" autoComplete="current-password" required autoFocus />
      <Field label={a.next} name="next" type="password" autoComplete="new-password" minLength={10} required aria-describedby="pw-hint" />
      <Field label={a.confirm} name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      <p id="pw-hint" className="-mt-2 text-[11px] text-ink-faint">
        {a.hint}
      </p>
      {message && (
        <p role="alert" className="text-sm text-rose-600">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? a.saving : a.save}
      </button>
    </form>
  );
}
