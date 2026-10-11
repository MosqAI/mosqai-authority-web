import { AppShell } from "@/components/shell/app-shell";
import { getAlerts } from "@/lib/api";
import { getSessionUser } from "@/lib/session";

export default async function ConsoleLayout({ children }: LayoutProps<"/">) {
  const [user, alerts] = await Promise.all([getSessionUser(), getAlerts()]);
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;

  return <AppShell user={user} openAlerts={openAlerts}>{children}</AppShell>;
}
