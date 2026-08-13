"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DataTable, type Column } from "@/components/data/data-table";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-provider";
import { getUsers } from "@/features/users/users-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getActivityLogs, type ActivityLog } from "./activity-api";

const actions = [
  "student.created",
  "student.updated",
  "enrollment.created",
  "payment.received",
  "attendance.updated",
  "user.created",
  "user.activated",
  "user.deactivated",
  "user.updated",
];

export function ActivityLogPage() {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());
  const users = useQuery({ queryKey: ["users", "activity-filter"], queryFn: () => getUsers(""), enabled: auth.data?.role === "admin" });
  const logs = useQuery({
    queryKey: ["activity-logs", debouncedSearch, userId, action, date, page],
    queryFn: () => getActivityLogs({ search: debouncedSearch, user_id: userId, action, date, page: String(page) }),
    enabled: auth.data?.role === "admin",
  });

  if (auth.isLoading || !auth.data) {
    return <LoadingSkeleton className="h-80" />;
  }

  if (auth.data && auth.data.role !== "admin") {
    return <ErrorState title="Admin permission required" description="Only admin users can view activity logs." />;
  }

  const columns: Column<ActivityLog>[] = [
    { key: "created_at", header: "Time", render: (row) => formatDateTime(row.created_at) },
    { key: "user", header: "User", render: (row) => row.user?.name ?? "System" },
    { key: "action", header: "Action", render: (row) => <span className="font-medium text-slate-900">{row.action}</span> },
    { key: "entity", header: "Entity", render: (row) => `${row.entity_type} #${row.entity_id}` },
    { key: "description", header: "Description" },
    { key: "metadata", header: "Metadata", render: (row) => row.metadata ? <code className="text-xs text-slate-500">{compactMetadata(row.metadata)}</code> : "-" },
  ];
  const lastPage = Number(logs.data?.meta?.last_page ?? 1);

  return (
    <>
      <PageHeader title="Activity Log" description="Audit trail for important staff actions." />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-3 md:grid-cols-4">
          <Field label="Search activity"><SearchInput value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search description, action, entity" /></Field>
          <Field label="User"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={userId} onChange={(event) => { setUserId(event.target.value); setPage(1); }}>
            <option value="">All users</option>
            {users.data?.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select></Field>
          <Field label="Action"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }}>
            <option value="">All actions</option>
            {actions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select></Field>
          <Field label="Date"><Input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} /></Field>
        </div>

        {logs.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {logs.isError ? <ErrorState title="Activity logs could not load" description="The API could not return activity logs. Please retry after logging in as an admin." onRetry={() => logs.refetch()} /> : null}
        {logs.data && logs.data.data.length > 0 ? <DataTable columns={columns} data={logs.data.data} /> : null}
        {logs.data && logs.data.data.length === 0 ? <EmptyState icon={ShieldCheck} title="No activity found" description="Important audited actions will appear here." /> : null}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page <span className="font-medium text-slate-950">{page}</span> of <span className="font-medium text-slate-950">{lastPage}</span></p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      </section>
    </>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function compactMetadata(metadata: Record<string, unknown>) {
  const text = JSON.stringify(metadata);
  return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}
