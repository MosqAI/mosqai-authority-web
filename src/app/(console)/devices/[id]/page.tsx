import { ArrowLeft, BatteryMedium, Clock, Map, MapPin, ScanLine, Settings } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, deviceStatusTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UnderDevelopmentButton } from "@/components/ui/under-development";
import { PageContainer } from "@/components/ui/page-header";
import { fmt } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getDevice, getDeviceSyncs } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/devices/[id]">) {
  const [{ id }, { t }] = await Promise.all([params, getI18n()]);
  return { title: fmt(t.devices.heading, { id }) };
}

export default async function DeviceDetailsPage({ params }: PageProps<"/devices/[id]">) {
  const [{ id }, { t, f }] = await Promise.all([params, getI18n()]);
  const device = await getDevice(id);
  if (!device) notFound();
  const syncs = await getDeviceSyncs(id);
  const busiest = Math.max(...syncs.map((s) => s.captures));

  const specs: { term: string; detail: React.ReactNode }[] = [
    {
      term: t.devices.type,
      detail: (
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <ScanLine className="size-4 text-accent" aria-hidden /> {t.enums.deviceType[device.type]}
        </span>
      ),
    },
    {
      term: t.devices.location,
      detail: (
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <MapPin className="size-4 text-rose-500" aria-hidden /> {device.sector}
        </span>
      ),
    },
    { term: t.devices.installed, detail: f.date(device.installedAt) },
    { term: t.devices.lastSeen, detail: device.lastSeenAt ? f.dateTime(device.lastSeenAt) : t.devices.never },
    {
      term: t.devices.nextMaintenance,
      detail: <Badge tone="warning">{f.date(device.nextMaintenanceAt)}</Badge>,
    },
  ];

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <Link href="/devices" className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
            <ArrowLeft className="size-3.5" aria-hidden /> {t.devices.back}
          </Link>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">{fmt(t.devices.heading, { id: device.id })}</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge tone={deviceStatusTone[device.status]} className="px-3 py-1.5 text-xs">
            <span className="size-2 rounded-full bg-current" />
            {t.enums.deviceStatus[device.status]}
          </Badge>
          <Badge tone="neutral" className="px-3 py-1.5 text-xs">
            <BatteryMedium className="size-3.5" aria-hidden />
            {device.batteryPct === null ? t.common.noData : `${device.batteryPct}%`}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="flex flex-col gap-5 p-6 lg:col-span-7 lg:self-start">
          <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-faint uppercase">
            <Clock className="size-4" aria-hidden /> {t.devices.specs}
          </h2>
          <dl className="divide-y divide-white/70 text-sm">
            {specs.map(({ term, detail }) => (
              <div key={term} className="flex items-center justify-between py-3.5">
                <dt className="text-ink-soft">{term}</dt>
                <dd className="text-ink">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ButtonLink href={`/map?device=${device.id}`} className="py-3 text-sm">
              <Map className="size-4" aria-hidden /> {t.devices.viewOnMap}
            </ButtonLink>
            <UnderDevelopmentButton variant="secondary" className="py-3 text-sm">
              <Settings className="size-4" aria-hidden /> {t.devices.maintenance}
            </UnderDevelopmentButton>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-5 lg:self-start">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">{t.devices.recentActivity}</h2>
            <Badge tone="info">{t.devices.automatedSync}</Badge>
          </div>
          <ul className="divide-y divide-white/70">
            {syncs.map((sync) => (
              <li key={sync.at} className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-3">
                  <span className="size-2.5 rounded-full bg-accent" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{f.date(sync.at)}</span>
                    <span className="block text-[11px] text-ink-faint">{f.time(sync.at)}</span>
                  </span>
                </span>
                <Badge tone={sync.captures === busiest ? "info" : "neutral"}>{fmt(t.devices.captures, { count: sync.captures })}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[11px] text-ink-faint">{fmt(t.devices.lastSyncs, { count: syncs.length })}</p>
        </Card>
      </div>
    </PageContainer>
  );
}
