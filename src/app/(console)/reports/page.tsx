import { ReportsView } from "@/components/reports/reports-view";
import { PageContainer } from "@/components/ui/page-header";
import { getI18n } from "@/i18n/server";
import { getReports, getSummary } from "@/lib/api";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.reports.title };
}

export default async function ReportsPage() {
  const [reports, summary] = await Promise.all([getReports(), getSummary()]);

  return (
    <PageContainer>
      <ReportsView reports={reports} summary={summary} />
    </PageContainer>
  );
}
