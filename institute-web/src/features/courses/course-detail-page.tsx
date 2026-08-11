"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Edit, Receipt, Users } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { CourseFormDialog } from "./course-form-dialog";
import { getCourse } from "./courses-api";

function formatFee(value: string) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}

export function CourseDetailPage({ id }: { id: number }) {
  const courseQuery = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
  });

  if (courseQuery.isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return <ErrorState title="Course not found" description="This course could not be loaded." />;
  }

  const course = courseQuery.data;
  const duration = course.duration_value && course.duration_unit ? `${course.duration_value} ${course.duration_unit}` : "Not set";

  return (
    <>
      <PageHeader
        title={course.name}
        description={course.code || "Course detail"}
        actions={
          <CourseFormDialog course={course}>
            <Button>
              <Edit className="h-4 w-4" />
              Edit course
            </Button>
          </CourseFormDialog>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-950">Course Information</h2>
            <StatusBadge status={course.status === "active" ? "active" : "inactive"} label={course.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Code", value: course.code || "Not set" },
              { label: "Duration", value: duration },
              { label: "Standard fee", value: formatFee(course.standard_fee) },
              { label: "Admission fee", value: formatFee(course.admission_fee) },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          {course.description ? <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{course.description}</p> : null}
        </section>
        <aside className="space-y-4">
          <EmptyState icon={CalendarDays} title="No batches yet" description="Batches for this course will appear here after batch management is added." />
          <EmptyState icon={Users} title="No enrolled students" description="Students will join courses through enrollments, not directly on the course record." />
          <EmptyState icon={Receipt} title="Fee details ready" description="Course fee history and payment rules can be shown here later." />
        </aside>
      </div>
    </>
  );
}
