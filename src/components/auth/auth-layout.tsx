import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/shell/language-switcher";

/** Centred card under the full logo, for the sign-in and password screens. */
export function AuthLayout({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-sm justify-end">
        <LanguageSwitcher />
      </div>
      <div className="flex w-full max-w-sm flex-1 flex-col justify-center gap-10 py-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <section className="glass p-7">
          <h1 className="text-xl text-ink">{title}</h1>
          {intro && <p className="mt-1.5 text-sm text-ink-soft">{intro}</p>}
          <div className="mt-6">{children}</div>
        </section>
        {footer && <p className="text-center text-xs leading-relaxed text-ink-faint">{footer}</p>}
      </div>
    </main>
  );
}
