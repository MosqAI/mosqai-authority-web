import { AlertsList } from "@/components/alerts/alerts-list";
import { PageContainer } from "@/components/ui/page-header";
import { getI18n } from "@/i18n/server";
import { getAlerts } from "@/lib/api";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.alerts.title };
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  return (
    <PageContainer>
      <AlertsList alerts={alerts} />
    </PageContainer>
  );
}
