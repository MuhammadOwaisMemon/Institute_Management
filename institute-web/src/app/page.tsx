import { Building2, CheckCircle2, Clock3, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { SearchInput } from "@/components/data/search-input";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

type PreviewRow = {
  id: number;
  area: string;
  owner: string;
  status: "active" | "pending" | "inactive";
  updated: string;
};

const previewRows: PreviewRow[] = [
  { id: 1, area: "Admissions desk", owner: "Front office", status: "active", updated: "Ready" },
  { id: 2, area: "Class schedule", owner: "Academic team", status: "pending", updated: "Planned" },
  { id: 3, area: "Fee counter", owner: "Accounts", status: "inactive", updated: "Not enabled" },
];

const columns: Column<PreviewRow>[] = [
  { key: "area", header: "Workspace" },
  { key: "owner", header: "Team" },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} label={row.status} />,
  },
  { key: "updated", header: "Setup" },
];

export default function Home() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="A clean foundation for daily institute operations."
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              New record
            </Button>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Institute profile", value: "Single branch", icon: Building2, tone: "bg-cyan-50 text-cyan-700" },
            { label: "Staff access", value: "Sanctum ready", icon: Users, tone: "bg-violet-50 text-violet-700" },
            { label: "System health", value: "API connected", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Operations scaffold</h2>
              <p className="mt-1 text-sm text-slate-500">Reusable table, search, status, and pagination components are ready.</p>
            </div>
            <SearchInput />
          </div>
          <div className="mt-5">
            <DataTable columns={columns} data={previewRows} />
            <Pagination page={1} totalPages={1} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <EmptyState icon={Clock3} title="Business modules are not enabled yet" description="Students, courses, classes, and fees will be added in later prompts." />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Loading pattern</h2>
            <div className="mt-5 space-y-3">
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-2/3" />
            </div>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
