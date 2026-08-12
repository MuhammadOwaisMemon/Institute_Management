import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { CertificatesPage } from "@/features/certificates/certificates-page";

export default function CertificatesRoutePage() {
  return (
    <AppShell>
      <PageContainer>
        <CertificatesPage />
      </PageContainer>
    </AppShell>
  );
}
