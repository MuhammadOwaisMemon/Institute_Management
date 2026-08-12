"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Eye, Plus, UserRound } from "lucide-react";
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
import { Field } from "@/components/ui/field";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { StudentFormDialog } from "./student-form-dialog";
import { getStudents, type Student } from "./students-api";

const map = { active: "active", completed: "inactive", dropped: "danger", inactive: "inactive" } as const;
export function StudentsPage() {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const q = useQuery({ queryKey: ["students", debouncedSearch, status], queryFn: () => getStudents({ search: debouncedSearch, status }) });
  const columns: Column<Student>[] = [
    { key: "student_code", header: "Code" }, { key: "full_name", header: "Student" }, { key: "phone", header: "Phone" },
    { key: "guardian", header: "Guardian", render: (r) => r.father_guardian_name || "Not set" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={map[r.status]} label={r.status} /> },
    { key: "actions", header: "", render: (r) => <div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link href={`/students/${r.id}`}><Eye className="h-4 w-4" /> View</Link></Button><StudentFormDialog student={r}><Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button></StudentFormDialog></div> },
  ];
  return <>
    <PageHeader title="Students" description="Manage student records, contacts, and profile status." actions={<StudentFormDialog><Button><Plus className="h-4 w-4" /> Add student</Button></StudentFormDialog>} />
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]"><Field label="Search students"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, code, or phone" /></Field><Field label="Status"><select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="completed">Completed</option><option value="dropped">Dropped</option><option value="inactive">Inactive</option></select></Field></div>
      {q.isLoading ? <LoadingSkeleton className="h-64" /> : null}
      {q.isError ? <ErrorState title="Students could not load" description="Please check your access and try again." onRetry={() => q.refetch()} /> : null}
      {q.data && q.data.data.length > 0 ? <DataTable columns={columns} data={q.data.data} /> : null}
      {q.data && q.data.data.length === 0 ? <EmptyState icon={UserRound} title="No students found" description="Add students before starting enrollments." /> : null}
    </section>
  </>;
}
