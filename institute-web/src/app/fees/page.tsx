import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { FeesPage } from "@/features/fees/fees-page";

export default function FeesRoutePage() {
  return <AppShell><PageContainer><FeesPage /></PageContainer></AppShell>;
}
