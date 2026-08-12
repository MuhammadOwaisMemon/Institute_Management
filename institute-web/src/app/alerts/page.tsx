import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { AlertsPage } from "@/features/alerts/alerts-page";

export default function AlertsRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <AlertsPage />
      </PageContainer>
    </AppShell>
  );
}
