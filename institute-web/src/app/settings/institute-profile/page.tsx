import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { InstituteProfileForm } from "@/features/settings/institute-profile-form";

export default function InstituteProfilePage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader title="Institute Profile" description="Manage the identity, contact details, and local defaults for this institute." />
        <InstituteProfileForm />
      </PageContainer>
    </AppShell>
  );
}
