import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { ReportsPage } from "@/features/reports/reports-page";

export default function ReportsRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <ReportsPage />
      </PageContainer>
    </AppShell>
  );
}
