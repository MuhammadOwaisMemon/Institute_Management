"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Eye, Plus, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable, type Column } from "@/components/data/data-table";
import { SearchInput } from "@/components/data/search-input";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTeachers, type Teacher } from "./teachers-api";
import { TeacherFormDialog } from "./teacher-form-dialog";

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const teachersQuery = useQuery({
    queryKey: ["teachers", search, status],
    queryFn: () => getTeachers({ search, status }),
  });

  const columns: Column<Teacher>[] = [
    { key: "employee_code", header: "Code", render: (row) => row.employee_code || "Not set" },
    { key: "full_name", header: "Teacher" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email", render: (row) => row.email || "Not set" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "active" ? "active" : "inactive"} label={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/teachers/${row.id}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <TeacherFormDialog teacher={row}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </TeacherFormDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Manage teaching staff profiles and availability status."
        actions={
          <TeacherFormDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Add teacher
            </Button>
          </TeacherFormDialog>
        }
      />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search teachers" />
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {teachersQuery.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {teachersQuery.isError ? <ErrorState title="Teachers could not load" description="Please check your access and try again." onRetry={() => teachersQuery.refetch()} /> : null}
        {teachersQuery.data && teachersQuery.data.data.length > 0 ? <DataTable columns={columns} data={teachersQuery.data.data} /> : null}
        {teachersQuery.data && teachersQuery.data.data.length === 0 ? <EmptyState icon={UserRoundCheck} title="No teachers found" description="Add teacher profiles as your academic team grows." /> : null}
      </section>
    </>
  );
}
