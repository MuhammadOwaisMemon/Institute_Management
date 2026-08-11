import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { SchedulePage } from "@/features/schedule/schedule-page";

export default function ScheduleRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <SchedulePage />
      </PageContainer>
    </AppShell>
  );
}
