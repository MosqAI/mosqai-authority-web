import { AnalyticsView } from "@/components/analytics/analytics-view";
import { getI18n } from "@/i18n/server";
import { PageContainer } from "@/components/ui/page-header";
import { getAreaDays, getAreas, getHourlyShare } from "@/lib/api";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.analytics.title };
}

export default async function AnalyticsPage() {
  const [areas, series, hourly] = await Promise.all([getAreas(), getAreaDays(), getHourlyShare()]);

  return (
    <PageContainer>
      <AnalyticsView areas={areas} series={series} hourly={hourly} />
    </PageContainer>
  );
}
