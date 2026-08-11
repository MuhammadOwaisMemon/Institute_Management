import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { UsersPage } from "@/features/users/users-page";

export default function SettingsUsersPage() {
  return (
    <AppShell>
      <PageContainer>
        <UsersPage />
      </PageContainer>
    </AppShell>
  );
}
