import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/auth-forms";
import { getI18n } from "@/i18n/server";
import { authEnabled } from "@/lib/session-cookies";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.auth.title };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Sample-data mode has no accounts.
  if (!authEnabled) redirect("/");
  const { t } = await getI18n();
  const { next, error } = await searchParams;
  return (
    <AuthLayout title={t.auth.title} intro={t.auth.subtitle} footer={t.auth.help}>
      <SignInForm next={typeof next === "string" ? next : undefined} initialError={error === "owner" ? "owner" : undefined} />
    </AuthLayout>
  );
}
