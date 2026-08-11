import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { CoursesPage } from "@/features/courses/courses-page";

export default function CoursesRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <CoursesPage />
      </PageContainer>
    </AppShell>
  );
}
