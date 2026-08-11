import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { CourseDetailPage } from "@/features/courses/course-detail-page";

export default async function CourseDetailRoutePage({ params }: PageProps<"/courses/[id]">) {
  const { id } = await params;

  return (
    <AppShell>
      <PageContainer>
        <CourseDetailPage id={Number(id)} />
      </PageContainer>
    </AppShell>
  );
}
