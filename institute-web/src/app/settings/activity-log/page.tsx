import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { ActivityLogPage } from "@/features/activity/activity-log-page";

export default function ActivityLogRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <ActivityLogPage />
      </PageContainer>
    </AppShell>
  );
}
