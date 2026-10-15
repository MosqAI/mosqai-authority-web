import { DevicesTable } from "@/components/devices/devices-table";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { getI18n } from "@/i18n/server";
import { getAreas, getDevices } from "@/lib/api";
import { can, getSessionUser } from "@/lib/session";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.devices.title };
}

export default async function DevicesPage({ searchParams }: PageProps<"/devices">) {
  const canAdd = can.registerDevices((await getSessionUser()).role);
  const { q, add } = await searchParams;
  const [{ t }, devices, areas] = await Promise.all([getI18n(), getDevices(), getAreas()]);

  return (
    <PageContainer>
      <PageHeader title={t.devices.title} description={t.devices.description} />
      {/* key resets the table's local state when a new global search arrives. */}
      <DevicesTable
        key={String(q ?? "")}
        devices={devices}
        areas={areas}
        initialQuery={typeof q === "string" ? q : ""}
        openAdd={add === "1" && canAdd}
        canAdd={canAdd}
      />
    </PageContainer>
  );
}
