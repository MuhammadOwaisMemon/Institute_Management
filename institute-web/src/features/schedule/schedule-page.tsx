"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Clock, DoorOpen, UserRound } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { getBatches, type Batch, type Weekday } from "@/features/batches/batches-api";
import { getCourses } from "@/features/courses/courses-api";
import { getTeachers } from "@/features/teachers/teachers-api";
import { getSchedule } from "./schedule-api";

const days: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function SchedulePage() {
  const teachers = useQuery({ queryKey: ["teachers", "schedule"], queryFn: () => getTeachers({ status: "active" }) });
  const courses = useQuery({ queryKey: ["courses", "schedule"], queryFn: () => getCourses({ status: "active" }) });
  const batches = useQuery({ queryKey: ["batches", "schedule"], queryFn: () => getBatches({ status: "active" }) });
  const filters = useScheduleFilters();
  const schedule = useQuery({ queryKey: ["schedule", filters.values], queryFn: () => getSchedule(filters.values) });

  return (
    <>
      <PageHeader title="Class Schedule" description="Daily and weekly timetable from active batch schedules." />
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <Select value={filters.values.teacher_id ?? ""} onChange={(value) => filters.set("teacher_id", value)} label="All teachers" options={teachers.data?.data.map((teacher) => ({ label: teacher.full_name, value: String(teacher.id) })) ?? []} />
          <Select value={filters.values.course_id ?? ""} onChange={(value) => filters.set("course_id", value)} label="All courses" options={courses.data?.data.map((course) => ({ label: course.name, value: String(course.id) })) ?? []} />
          <Select value={filters.values.batch_id ?? ""} onChange={(value) => filters.set("batch_id", value)} label="All batches" options={batches.data?.data.map((batch) => ({ label: batch.name, value: String(batch.id) })) ?? []} />
          <Select value={filters.values.day ?? ""} onChange={(value) => filters.set("day", value)} label="All days" options={days.map((day) => ({ label: title(day), value: day }))} />
        </div>
      </section>

      {schedule.isLoading ? <LoadingSkeleton className="h-72" /> : null}
      {schedule.data ? (
        <div className="space-y-6">
          <ConflictWarnings conflicts={schedule.data.conflicts} />
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">Today&apos;s Classes</h2>
            {schedule.data.today.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{schedule.data.today.map((batch) => <ClassCard key={batch.id} batch={batch} />)}</div> : <EmptyState icon={CalendarClock} title="No classes today" description="Classes scheduled for the current weekday will appear here." />}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">Weekly Schedule</h2>
            <div className="grid gap-4 xl:grid-cols-7 md:grid-cols-2">
              {days.map((day) => (
                <div key={day} className="min-h-52 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-3 text-sm font-semibold text-slate-900">{title(day)}</p>
                  <div className="space-y-3">{schedule.data.weekly[day]?.length ? schedule.data.weekly[day].map((batch) => <CompactClassCard key={batch.id} batch={batch} />) : <p className="text-sm text-slate-400">No classes</p>}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-950">Teacher Schedule</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {schedule.data.teacher_schedule.length ? schedule.data.teacher_schedule.map((group, index) => (
                <div key={group.teacher?.id ?? index} className="rounded-lg border border-slate-100 p-4">
                  <p className="font-semibold text-slate-950">{group.teacher?.full_name ?? "Unassigned Teacher"}</p>
                  <div className="mt-3 space-y-3">{group.classes.map((batch) => <CompactClassCard key={batch.id} batch={batch} />)}</div>
                </div>
              )) : <EmptyState icon={UserRound} title="No teacher schedule" description="Assigned active batches will appear here." />}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function useScheduleFilters() {
  const [values, setValues] = useState<{ teacher_id?: string; course_id?: string; batch_id?: string; day?: string }>({});
  return {
    values,
    set: (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value || undefined })),
  };
}

function Select({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: { label: string; value: string }[] }) {
  return <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function ClassCard({ batch }: { batch: Batch }) {
  return (
    <article className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-base font-semibold text-slate-950">{batch.course?.name ?? "Course"}</p>
      <p className="mt-1 text-sm text-slate-500">{batch.name}</p>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(batch.start_time)} - {formatTime(batch.end_time)}</p>
        <p className="flex items-center gap-2"><UserRound className="h-4 w-4" />{batch.teacher?.full_name ?? "Unassigned"}</p>
        <p className="flex items-center gap-2"><DoorOpen className="h-4 w-4" />{batch.room ?? "No room"}</p>
      </div>
    </article>
  );
}

function CompactClassCard({ batch }: { batch: Batch }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-950">{batch.course?.name ?? "Course"}</p>
      <p className="mt-1 text-xs text-slate-500">{batch.name}</p>
      <p className="mt-2 text-xs font-medium text-slate-700">{formatTime(batch.start_time)} - {formatTime(batch.end_time)}</p>
      <p className="mt-1 text-xs text-slate-500">{batch.teacher?.full_name ?? "Unassigned"} · {batch.room ?? "No room"}</p>
    </div>
  );
}

function ConflictWarnings({ conflicts }: { conflicts: { type: string; message: string; days: Weekday[]; batches: Batch[] }[] }) {
  if (!conflicts.length) {
    return null;
  }
  return <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">{conflicts.map((conflict, index) => <div key={`${conflict.type}-${index}`} className="flex gap-3 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p><span className="font-semibold">{conflict.message}</span> {conflict.batches.map((batch) => batch.name).join(" and ")} overlap on {conflict.days.map(title).join(", ")}.</p></div>)}</section>;
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-PK", { hour: "2-digit", minute: "2-digit" }).format(new Date(2026, 0, 1, hours, minutes));
}

function title(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
