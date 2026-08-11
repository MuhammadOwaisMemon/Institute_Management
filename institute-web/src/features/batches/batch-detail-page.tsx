"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Edit, Receipt, Users, ClipboardCheck } from "lucide-react";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BatchFormDialog } from "./batch-form-dialog";
import { getBatch, type BatchStatus } from "./batches-api";

const statusMap: Record<BatchStatus, "active" | "inactive" | "pending" | "danger"> = {
  upcoming: "pending",
  active: "active",
  completed: "inactive",
  cancelled: "danger",
};

function title(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BatchDetailPage({ id }: { id: number }) {
  const batchQuery = useQuery({ queryKey: ["batch", id], queryFn: () => getBatch(id) });

  if (batchQuery.isLoading) return <LoadingSkeleton className="h-96" />;
  if (batchQuery.isError || !batchQuery.data) return <ErrorState title="Batch not found" description="This batch could not be loaded." />;

  const batch = batchQuery.data;

  return (
    <>
      <PageHeader title={batch.name} description={batch.batch_code || "Batch detail"} actions={<BatchFormDialog batch={batch}><Button><Edit className="h-4 w-4" /> Edit batch</Button></BatchFormDialog>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-950">Batch Information</h2>
            <StatusBadge status={statusMap[batch.status]} label={title(batch.status)} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Course", value: batch.course?.name || "Not set" },
              { label: "Teacher", value: batch.teacher?.full_name || "Not assigned" },
              { label: "Dates", value: `${batch.start_date}${batch.expected_end_date ? ` to ${batch.expected_end_date}` : ""}` },
              { label: "Time", value: `${batch.start_time} - ${batch.end_time}` },
              { label: "Weekdays", value: batch.weekdays.map(title).join(", ") },
              { label: "Capacity", value: batch.capacity ? `${batch.capacity} seats` : "Not set" },
              { label: "Room", value: batch.room || "Not set" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          {batch.notes ? <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{batch.notes}</p> : null}
        </section>
        <aside className="space-y-4">
          <EmptyState icon={Users} title="No enrolled students yet" description="Enrollments will connect students to this batch later." />
          <EmptyState icon={ClipboardCheck} title="Attendance summary pending" description="Attendance totals will appear after attendance is implemented." />
          <EmptyState icon={Receipt} title="Fee summary pending" description="Batch fee collection summaries will appear after fee workflows are added." />
          <EmptyState icon={CalendarDays} title="Schedule ready" description="This batch schedule is stored and ready for calendar views later." />
        </aside>
      </div>
    </>
  );
}
