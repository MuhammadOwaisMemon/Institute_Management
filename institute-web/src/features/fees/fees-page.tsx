"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createInstallment, getFees, type FeeInstallment } from "./fees-api";

const statusMap = { pending: "pending", partially_paid: "pending", paid: "active", overdue: "danger" } as const;
function money(v: string) { return `PKR ${Number(v).toLocaleString("en-PK")}`; }
export function FeesPage() {
  const [status, setStatus] = useState(""); const [dueDate, setDueDate] = useState("");
  const [enrollmentId, setEnrollmentId] = useState(""); const [title, setTitle] = useState("Full Fee"); const [amount, setAmount] = useState(0); const [installmentDue, setInstallmentDue] = useState("");
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["fees", status, dueDate], queryFn: () => getFees({ status, due_date: dueDate }) });
  const m = useMutation({ mutationFn: createInstallment, onSuccess: () => { ["fees", "dashboard", "alerts", "reports"].forEach((key) => qc.invalidateQueries({ queryKey: [key] })); toast.success("Installment added."); }, onError: () => toast.error("Installment total cannot exceed payable amount.") });
  const columns: Column<FeeInstallment>[] = [
    { key: "title", header: "Installment" },
    { key: "student", header: "Student", render: (r) => r.enrollment?.student.full_name ?? "Not set" },
    { key: "course", header: "Course", render: (r) => r.enrollment?.course.name ?? "Not set" },
    { key: "due_date", header: "Due date" },
    { key: "amount", header: "Amount", render: (r) => money(r.amount) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={statusMap[r.status]} label={r.status.replace("_", " ")} /> },
  ];
  return <>
    <PageHeader title="Fees" description="Schedule enrollment fees as full payments or installments." />
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">Create Installment</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Field label="Enrollment ID"><Input placeholder="e.g. 102" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} /></Field><Field label="Installment title"><Input placeholder="Full Fee" value={title} onChange={(e) => setTitle(e.target.value)} /></Field><Field label="Due date"><Input type="date" value={installmentDue} onChange={(e) => setInstallmentDue(e.target.value)} /></Field><Field label="Amount"><Input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field><div className="flex items-end"><Button className="w-full" onClick={() => m.mutate({ enrollment_id: Number(enrollmentId), title, due_date: installmentDue, amount })} disabled={!enrollmentId || !title || !installmentDue || amount <= 0 || m.isPending}><Plus className="h-4 w-4" /> Add</Button></div></div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-2xl"><Field label="Status"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="partially_paid">Partially Paid</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></Field><Field label="Due date"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field></div>
      {q.isLoading ? <LoadingSkeleton className="h-64" /> : null}
      {q.data && q.data.data.length > 0 ? <DataTable columns={columns} data={q.data.data} /> : null}
      {q.data && q.data.data.length === 0 ? <EmptyState icon={Receipt} title="No fee installments found" description="Create installments after admissions are confirmed." /> : null}
    </section>
  </>;
}
