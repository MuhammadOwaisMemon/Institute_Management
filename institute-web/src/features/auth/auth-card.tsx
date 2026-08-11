import { GraduationCap } from "lucide-react";
import { ReactNode } from "react";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Institute Suite</p>
            <p className="text-xs text-slate-500">Secure staff access</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
