import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { TeachersPage } from "@/features/teachers/teachers-page";

export default function TeachersRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <TeachersPage />
      </PageContainer>
    </AppShell>
  );
}
