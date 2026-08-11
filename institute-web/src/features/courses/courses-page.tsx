"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, Edit, Eye, Plus } from "lucide-react";
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
import { CourseFormDialog } from "./course-form-dialog";
import { getCourses, type Course } from "./courses-api";

function formatFee(value: string) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}

function formatDuration(course: Course) {
  if (!course.duration_value || !course.duration_unit) {
    return "Not set";
  }

  return `${course.duration_value} ${course.duration_unit}`;
}

export function CoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const coursesQuery = useQuery({
    queryKey: ["courses", search, status],
    queryFn: () => getCourses({ search, status }),
  });

  const columns: Column<Course>[] = [
    { key: "code", header: "Code", render: (row) => row.code || "Not set" },
    { key: "name", header: "Course" },
    { key: "duration", header: "Duration", render: formatDuration },
    { key: "standard_fee", header: "Standard fee", render: (row) => formatFee(row.standard_fee) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "active" ? "active" : "inactive"} label={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/courses/${row.id}`}>
              <Eye className="h-4 w-4" />
              View
            </Link>
          </Button>
          <CourseFormDialog course={row}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </CourseFormDialog>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Courses"
        description="Manage the institute course catalog and fee defaults."
        actions={
          <CourseFormDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Create course
            </Button>
          </CourseFormDialog>
        }
      />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" />
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {coursesQuery.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {coursesQuery.isError ? <ErrorState title="Courses could not load" description="Please check your access and try again." onRetry={() => coursesQuery.refetch()} /> : null}
        {coursesQuery.data && coursesQuery.data.data.length > 0 ? <DataTable columns={columns} data={coursesQuery.data.data} /> : null}
        {coursesQuery.data && coursesQuery.data.data.length === 0 ? <EmptyState icon={BookOpen} title="No courses found" description="Create courses such as IELTS Preparation, MS Office, or Web Development." /> : null}
      </section>
    </>
  );
}
