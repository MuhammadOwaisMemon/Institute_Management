"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Edit, Eye, Plus } from "lucide-react";
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
import { getCourses } from "@/features/courses/courses-api";
import { getTeachers } from "@/features/teachers/teachers-api";
import { BatchFormDialog } from "./batch-form-dialog";
import { getBatches, type Batch, type BatchStatus } from "./batches-api";

const statusMap: Record<BatchStatus, "active" | "inactive" | "pending" | "danger"> = {
  upcoming: "pending",
  active: "active",
  completed: "inactive",
  cancelled: "danger",
};

function title(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BatchesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const batchesQuery = useQuery({
    queryKey: ["batches", search, status, courseId, teacherId],
    queryFn: () => getBatches({ search, status, course_id: courseId, teacher_id: teacherId }),
  });
  const coursesQuery = useQuery({ queryKey: ["courses", "filter-options"], queryFn: () => getCourses({ status: "active" }) });
  const teachersQuery = useQuery({ queryKey: ["teachers", "filter-options"], queryFn: () => getTeachers({ status: "active" }) });

  const columns: Column<Batch>[] = [
    { key: "batch_code", header: "Code", render: (row) => row.batch_code || "Not set" },
    { key: "name", header: "Batch" },
    { key: "course", header: "Course", render: (row) => row.course?.name || "Not set" },
    { key: "teacher", header: "Teacher", render: (row) => row.teacher?.full_name || "Not assigned" },
    { key: "schedule", header: "Schedule", render: (row) => `${row.start_time} - ${row.end_time}` },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={statusMap[row.status]} label={title(row.status)} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm"><Link href={`/batches/${row.id}`}><Eye className="h-4 w-4" /> View</Link></Button>
          <BatchFormDialog batch={row}><Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button></BatchFormDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Batches" description="Plan course batches, schedules, rooms, and teaching assignments." actions={<BatchFormDialog><Button><Plus className="h-4 w-4" /> Create batch</Button></BatchFormDialog>} />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search batches" />
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">All courses</option>
            {coursesQuery.data?.data.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none" value={teacherId} onChange={(event) => setTeacherId(event.target.value)}>
            <option value="">All teachers</option>
            {teachersQuery.data?.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}
          </select>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {batchesQuery.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {batchesQuery.isError ? <ErrorState title="Batches could not load" description="Please check your access and try again." onRetry={() => batchesQuery.refetch()} /> : null}
        {batchesQuery.data && batchesQuery.data.data.length > 0 ? <DataTable columns={columns} data={batchesQuery.data.data} /> : null}
        {batchesQuery.data && batchesQuery.data.data.length === 0 ? <EmptyState icon={CalendarDays} title="No batches found" description="Create Morning, Evening, or Weekend batches for your active courses." /> : null}
      </section>
    </>
  );
}
