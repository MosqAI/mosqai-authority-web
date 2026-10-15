import { SettingsForm } from "@/components/settings/settings-form";
import { getSessionUser } from "@/lib/session";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { getI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.settings.title };
}

export default async function SettingsPage() {
  const { t } = await getI18n();
  return (
    <PageContainer>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <SettingsForm user={await getSessionUser()} />
    </PageContainer>
  );
}
