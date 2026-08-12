"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getBatches } from "@/features/batches/batches-api";
import { getCourses } from "@/features/courses/courses-api";
import { cn } from "@/lib/utils";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { Attendance } from "@/features/attendance/attendance-api";
import type { Payment } from "@/features/payments/payments-api";
import type { Student } from "@/features/students/students-api";
import {
  exportReport,
  getAdmissionReport,
  getAttendanceReport,
  getBatchStudentsReport,
  getFeeCollectionReport,
  getPendingFeeReport,
  getStudentReport,
  type PendingFeeReportRow,
  type ReportMeta,
  type ReportResponse,
  type ReportType,
} from "./reports-api";

const reports = [
  { key: "students", label: "Students" },
  { key: "admissions", label: "Admissions" },
  { key: "batch-students", label: "Batch Students" },
  { key: "fee-collection", label: "Fee Collection" },
  { key: "pending-fees", label: "Pending Fees" },
  { key: "attendance", label: "Attendance" },
] as const;

const methods = ["cash", "bank_transfer", "jazzcash", "easypaisa", "other"];

type Filters = Record<string, string>;

export function ReportsPage() {
  const [active, setActive] = useState<ReportType>("students");
  const [filters, setFilters] = useState<Filters>({ page: "1", per_page: "15" });
  const courses = useQuery({ queryKey: ["courses", "reports"], queryFn: () => getCourses({ status: "active" }) });
  const batches = useQuery({ queryKey: ["batches", "reports"], queryFn: () => getBatches({}) });
  const params = useMemo(() => clean(filters), [filters]);
  const report = useReportQuery(active, params);
  const csv = useMutation({
    mutationFn: () => exportReport(active, clean({ ...filters, page: "" })),
    onSuccess: () => toast.success("CSV export started."),
    onError: () => toast.error("CSV export could not be created."),
  });

  const setFilter = (key: string, value: string) => setFilters((current) => ({ ...current, [key]: value, page: "1" }));
  const setPage = (page: number) => setFilters((current) => ({ ...current, page: String(page) }));
  const resetForReport = (key: ReportType) => {
    setActive(key);
    setFilters({ page: "1", per_page: "15" });
  };

  return (
    <>
      <PageHeader
        title="Reports"
        description="Practical operational reports with filters, totals, pagination, and CSV export."
        actions={
          <Button onClick={() => csv.mutate()} disabled={csv.isPending || report.isLoading}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {reports.map((report) => (
            <button
              key={report.key}
              className={cn("h-10 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100", active === report.key && "bg-slate-950 text-white hover:bg-slate-900")}
              onClick={() => resetForReport(report.key)}
            >
              {report.label}
            </button>
          ))}
        </div>
      </section>

      <ReportFilters active={active} filters={filters} setFilter={setFilter} courses={courses.data?.data ?? []} batches={batches.data?.data ?? []} />

      {report.isLoading ? <LoadingSkeleton className="h-72" /> : null}
      {report.isError ? <ErrorState title="Report could not load" description="Please adjust filters or try again." onRetry={() => report.refetch()} /> : null}
      {report.data ? <ReportContent active={active} data={report.data.data} meta={report.data.meta} page={Number(filters.page ?? 1)} setPage={setPage} /> : null}
    </>
  );
}

function useReportQuery(active: ReportType, params: Filters) {
  return useQuery<ReportResponse<unknown>>({
    queryKey: ["reports", active, params],
    queryFn: async () => {
      if (active === "students") return await getStudentReport(params) as ReportResponse<unknown>;
      if (active === "admissions") return await getAdmissionReport(params) as ReportResponse<unknown>;
      if (active === "batch-students") return await getBatchStudentsReport(params) as ReportResponse<unknown>;
      if (active === "fee-collection") return await getFeeCollectionReport(params) as ReportResponse<unknown>;
      if (active === "pending-fees") return await getPendingFeeReport(params) as ReportResponse<unknown>;
      return await getAttendanceReport(params) as ReportResponse<unknown>;
    },
    enabled: active !== "batch-students" || Boolean(params.batch_id),
  });
}

function ReportFilters({ active, filters, setFilter, courses, batches }: { active: ReportType; filters: Filters; setFilter: (key: string, value: string) => void; courses: { id: number; name: string }[]; batches: { id: number; name: string }[] }) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        {active === "students" ? <Field label="Status"><Select value={filters.status ?? ""} onChange={(value) => setFilter("status", value)} label="All statuses" options={["active", "completed", "dropped", "inactive"].map((value) => ({ value, label: title(value) }))} /></Field> : null}
        {active === "students" ? <Field label="Joining from"><Input type="date" value={filters.joining_from ?? ""} onChange={(event) => setFilter("joining_from", event.target.value)} /></Field> : null}
        {active === "students" ? <Field label="Joining to"><Input type="date" value={filters.joining_to ?? ""} onChange={(event) => setFilter("joining_to", event.target.value)} /></Field> : null}

        {["students", "admissions", "fee-collection", "pending-fees"].includes(active) ? <Field label="Course"><Select value={filters.course_id ?? ""} onChange={(value) => setFilter("course_id", value)} label="All courses" options={courses.map((course) => ({ value: String(course.id), label: course.name }))} /></Field> : null}
        {["students", "admissions", "batch-students", "fee-collection", "pending-fees", "attendance"].includes(active) ? <Field label="Batch"><Select value={filters.batch_id ?? ""} onChange={(value) => setFilter("batch_id", value)} label={active === "batch-students" ? "Select batch" : "All batches"} options={batches.map((batch) => ({ value: String(batch.id), label: batch.name }))} /></Field> : null}

        {["admissions", "fee-collection", "attendance"].includes(active) ? <Field label="Date from"><Input type="date" value={filters.date_from ?? ""} onChange={(event) => setFilter("date_from", event.target.value)} /></Field> : null}
        {["admissions", "fee-collection", "attendance"].includes(active) ? <Field label="Date to"><Input type="date" value={filters.date_to ?? ""} onChange={(event) => setFilter("date_to", event.target.value)} /></Field> : null}
        {active === "fee-collection" ? <Field label="Payment method"><Select value={filters.payment_method ?? ""} onChange={(value) => setFilter("payment_method", value)} label="All methods" options={methods.map((method) => ({ value: method, label: title(method.replace("_", " ")) }))} /></Field> : null}
        {active === "attendance" ? <Field label="Student ID"><Input placeholder="Optional" value={filters.student_id ?? ""} onChange={(event) => setFilter("student_id", event.target.value)} /></Field> : null}
        {active === "attendance" ? <Field label="Month"><Input type="month" value={filters.month ?? ""} onChange={(event) => setFilter("month", event.target.value)} /></Field> : null}
      </div>
    </section>
  );
}

function ReportContent({ active, data, meta, page, setPage }: { active: ReportType; data: unknown[]; meta: ReportMeta; page: number; setPage: (page: number) => void }) {
  const table = tableFor(active, data);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Totals meta={meta} />
      {data.length ? <DataTable columns={table.columns} data={table.data} /> : <EmptyState icon={FileText} title="No report data" description="Try changing filters or selecting a batch." />}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Page <span className="font-medium text-slate-950">{page}</span> of <span className="font-medium text-slate-950">{meta.last_page || 1}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page >= (meta.last_page || 1)} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </section>
  );
}

function tableFor(active: ReportType, data: unknown[]): { columns: Column<{ id: number | string }>[]; data: { id: number | string }[] } {
  if (active === "students") {
    const rows = data as Student[];
    return { data: rows, columns: [{ key: "student_code", header: "Code" }, { key: "full_name", header: "Student" }, { key: "phone", header: "Phone" }, { key: "joining_date", header: "Joining" }, { key: "status", header: "Status", render: (row) => title(String((row as Student).status)) }] };
  }
  if (active === "admissions" || active === "batch-students") {
    const rows = data as Enrollment[];
    return { data: rows, columns: [{ key: "student", header: "Student", render: (row) => (row as Enrollment).student.full_name }, { key: "course", header: "Course", render: (row) => (row as Enrollment).course.name }, { key: "batch", header: "Batch", render: (row) => (row as Enrollment).batch.name }, { key: "enrollment_date", header: "Date" }, { key: "final_course_fee", header: "Final Fee", render: (row) => money((row as Enrollment).final_course_fee) }, { key: "status", header: "Status", render: (row) => title((row as Enrollment).status) }] };
  }
  if (active === "fee-collection") {
    const rows = data as Payment[];
    return { data: rows, columns: [{ key: "receipt_number", header: "Receipt" }, { key: "student", header: "Student", render: (row) => (row as Payment).student.full_name }, { key: "course", header: "Course", render: (row) => (row as Payment).enrollment.course.name }, { key: "batch", header: "Batch", render: (row) => (row as Payment).enrollment.batch.name }, { key: "payment_date", header: "Date" }, { key: "amount", header: "Amount", render: (row) => money((row as Payment).amount) }, { key: "payment_method", header: "Method", render: (row) => title((row as Payment).payment_method.replace("_", " ")) }, { key: "receiver", header: "Received By", render: (row) => (row as Payment).receiver?.name ?? "Staff" }] };
  }
  if (active === "pending-fees") {
    const rows = data as PendingFeeReportRow[];
    return { data: rows, columns: [{ key: "student", header: "Student" }, { key: "course", header: "Course" }, { key: "total_fee", header: "Total Fee", render: (row) => money((row as PendingFeeReportRow).total_fee) }, { key: "paid", header: "Paid", render: (row) => money((row as PendingFeeReportRow).paid) }, { key: "remaining", header: "Remaining", render: (row) => money((row as PendingFeeReportRow).remaining) }, { key: "next_due_date", header: "Next Due" }] };
  }
  const rows = data as Attendance[];
  return { data: rows, columns: [{ key: "attendance_date", header: "Date" }, { key: "student", header: "Student", render: (row) => (row as Attendance).student?.full_name }, { key: "batch", header: "Batch", render: (row) => (row as Attendance).batch?.name }, { key: "course", header: "Course", render: (row) => (row as Attendance).batch?.course?.name }, { key: "status", header: "Status", render: (row) => title((row as Attendance).status) }, { key: "remarks", header: "Remarks" }] };
}

function Totals({ meta }: { meta: ReportMeta }) {
  const items = [
    { label: "Rows", value: String(meta.total ?? 0) },
    meta.total_amount ? { label: "Amount", value: money(meta.total_amount) } : null,
    meta.total_final_fee ? { label: "Final Fee", value: money(meta.total_final_fee) } : null,
    meta.total_remaining ? { label: "Remaining", value: money(meta.total_remaining) } : null,
    meta.present !== undefined ? { label: "Present", value: String(meta.present) } : null,
    meta.absent !== undefined ? { label: "Absent", value: String(meta.absent) } : null,
    meta.leave !== undefined ? { label: "Leave", value: String(meta.leave) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className="mt-1 text-base font-semibold text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: { label: string; value: string }[] }) {
  return <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function clean(values: Filters) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== undefined));
}

function title(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function money(value: string | number) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}
