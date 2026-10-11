import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { UsersTable } from "@/components/users/users-table";
import { getI18n } from "@/i18n/server";
import { getUsers } from "@/lib/api";
import { can, requireRole } from "@/lib/session";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.users.title };
}

/** Super admins only: everyone else is sent back to the dashboard. */
export default async function UsersPage() {
  const me = await requireRole(can.manageUsers);
  const [{ t }, users] = await Promise.all([getI18n(), getUsers()]);

  return (
    <PageContainer>
      <PageHeader title={t.users.title} description={t.users.description} />
      <UsersTable users={users} currentUserId={me.id} />
    </PageContainer>
  );
}
