import { ReactNode } from "react";
import { Header } from "./header";
import { MobileNavigation } from "./mobile-navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          {children}
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
