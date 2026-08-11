import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { StudentsPage } from "@/features/students/students-page";

export default function StudentsRoutePage() {
  return <AppShell><PageContainer><StudentsPage /></PageContainer></AppShell>;
}
