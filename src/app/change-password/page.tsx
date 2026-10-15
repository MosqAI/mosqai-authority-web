import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ChangePasswordForm } from "@/components/auth/auth-forms";
import { getI18n } from "@/i18n/server";
import { SESSION, authEnabled } from "@/lib/session-cookies";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.changeTitle };
}

/** First sign-in with an admin-issued temporary password lands here (see proxy.ts). */
export default async function ChangePasswordPage() {
  if (!authEnabled) redirect("/");
  if ((await cookies()).get(SESSION.mustChange)?.value !== "1") redirect("/");
  const { t } = await getI18n();
  return (
    <AuthLayout title={t.auth.changeTitle} intro={t.auth.changeIntro}>
      <ChangePasswordForm />
    </AuthLayout>
  );
}
