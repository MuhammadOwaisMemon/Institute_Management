import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { TeacherProfilePage } from "@/features/teachers/teacher-profile-page";

export function generateStaticParams() {
  return Array.from({ length: 200 }, (_, index) => ({ id: String(index + 1) }));
}

export default async function TeacherProfileRoutePage({ params }: PageProps<"/teachers/[id]">) {
  const { id } = await params;

  return (
    <AppShell>
      <PageContainer>
        <TeacherProfilePage id={Number(id)} />
      </PageContainer>
    </AppShell>
  );
}
