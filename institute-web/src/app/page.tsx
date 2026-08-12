import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export default function Home() {
  return (
    <AppShell>
      <PageContainer>
        <DashboardPage />
      </PageContainer>
    </AppShell>
  );
}
