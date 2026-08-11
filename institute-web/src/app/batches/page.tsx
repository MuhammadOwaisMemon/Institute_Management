import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { BatchesPage } from "@/features/batches/batches-page";

export default function BatchesRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <BatchesPage />
      </PageContainer>
    </AppShell>
  );
}
