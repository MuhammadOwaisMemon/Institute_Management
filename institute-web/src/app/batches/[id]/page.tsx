import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { BatchDetailPage } from "@/features/batches/batch-detail-page";

export function generateStaticParams() {
  return Array.from({ length: 200 }, (_, index) => ({ id: String(index + 1) }));
}

export default async function BatchDetailRoutePage({ params }: PageProps<"/batches/[id]">) {
  const { id } = await params;

  return (
    <AppShell>
      <PageContainer>
        <BatchDetailPage id={Number(id)} />
      </PageContainer>
    </AppShell>
  );
}
