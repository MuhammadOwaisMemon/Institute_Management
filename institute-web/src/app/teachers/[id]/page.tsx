import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { TeacherProfilePage } from "@/features/teachers/teacher-profile-page";

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
