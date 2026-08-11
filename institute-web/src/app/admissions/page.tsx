import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { AdmissionPage } from "@/features/admissions/admission-page";

export default function AdmissionsRoutePage() {
  return <AppShell><PageContainer><AdmissionPage /></PageContainer></AppShell>;
}
