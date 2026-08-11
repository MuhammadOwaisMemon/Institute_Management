import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { StudentProfilePage } from "@/features/students/student-profile-page";

export default async function StudentProfileRoutePage({ params }: PageProps<"/students/[id]">) {
  const { id } = await params;
  return <AppShell><PageContainer><StudentProfilePage id={Number(id)} /></PageContainer></AppShell>;
}
