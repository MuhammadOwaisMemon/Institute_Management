"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Clock3, Edit, GraduationCap, Mail, MapPin, Phone, UserRoundCheck } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { getTeacher } from "./teachers-api";
import { TeacherFormDialog } from "./teacher-form-dialog";

export function TeacherProfilePage({ id }: { id: number }) {
  const teacherQuery = useQuery({
    queryKey: ["teacher", id],
    queryFn: () => getTeacher(id),
  });

  if (teacherQuery.isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (teacherQuery.isError || !teacherQuery.data) {
    return <ErrorState title="Teacher not found" description="This teacher profile could not be loaded." />;
  }

  const teacher = teacherQuery.data;

  return (
    <>
      <PageHeader
        title={teacher.full_name}
        description={teacher.employee_code || "Teacher profile"}
        actions={
          <TeacherFormDialog teacher={teacher}>
            <Button>
              <Edit className="h-4 w-4" />
              Edit teacher
            </Button>
          </TeacherFormDialog>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-950">Personal & Contact Details</h2>
            <StatusBadge status={teacher.status === "active" ? "active" : "inactive"} label={teacher.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Phone", value: teacher.phone, icon: Phone },
              { label: "Email", value: teacher.email || "Not set", icon: Mail },
              { label: "Gender", value: teacher.gender || "Not set", icon: UserRoundCheck },
              { label: "Joining date", value: teacher.joining_date || "Not set", icon: CalendarDays },
              { label: "CNIC", value: teacher.cnic || "Not set", icon: GraduationCap },
              { label: "Address", value: teacher.address || "Not set", icon: MapPin },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          {teacher.notes ? <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{teacher.notes}</p> : null}
        </section>
        <aside className="space-y-4">
          <EmptyState icon={BookOpen} title="No courses assigned" description="Courses will appear here after course management is added." />
          <EmptyState icon={CalendarDays} title="No active batches" description="Active batches will appear here once batches are available." />
          <EmptyState icon={Clock3} title="No schedule yet" description="Teaching schedule will appear here in the batches module." />
        </aside>
      </div>
    </>
  );
}
