import { SurveillanceMap } from "@/components/map/surveillance-map";
import { getI18n } from "@/i18n/server";
import { getAreas, getDevices } from "@/lib/api";
import { env } from "@/lib/env";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.map.title };
}

export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const { device, area } = await searchParams;
  const [devices, areas] = await Promise.all([getDevices(), getAreas()]);

  return (
    <SurveillanceMap
      devices={devices}
      areas={areas}
      styleUrl={env.NEXT_PUBLIC_MAP_STYLE_URL}
      focusDeviceId={typeof device === "string" ? device : undefined}
      focusArea={typeof area === "string" ? area : undefined}
    />
  );
}
