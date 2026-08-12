import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { ExamsPage } from "@/features/exams/exams-page";

export default function ExamsRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <ExamsPage />
      </PageContainer>
    </AppShell>
  );
}
