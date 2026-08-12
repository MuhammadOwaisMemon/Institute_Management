"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createCertificate, getCertificates, type Certificate } from "./certificates-api";

export function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const queryClient = useQueryClient();
  const certificates = useQuery({ queryKey: ["certificates", debouncedSearch], queryFn: () => getCertificates({ search: debouncedSearch }) });
  const create = useMutation({
    mutationFn: () => createCertificate({ enrollment_id: Number(enrollmentId), issue_date: issueDate, completion_date: completionDate, remarks: remarks || null }),
    onSuccess: (certificate) => {
      toast.success(`Certificate ${certificate.certificate_number} generated.`);
      setEnrollmentId("");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: () => toast.error("Certificate could not be generated. Check enrollment and dates."),
  });

  const columns: Column<Certificate>[] = [
    { key: "certificate_number", header: "Certificate No." },
    { key: "student", header: "Student", render: (row) => row.student?.full_name ?? "Student" },
    { key: "course", header: "Course", render: (row) => row.course?.name ?? "Course" },
    { key: "completion_date", header: "Completion" },
    { key: "issue_date", header: "Issue Date" },
    { key: "actions", header: "", render: (row) => <Button asChild variant="outline" size="sm"><Link href={`/certificates/${row.id}`}><Eye className="h-4 w-4" /> View</Link></Button> },
  ];

  return (
    <>
      <PageHeader title="Certificates" description="Generate course completion certificates and print professional copies." />
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Generate Certificate</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Enrollment ID"><Input placeholder="e.g. 102" value={enrollmentId} onChange={(event) => setEnrollmentId(event.target.value)} /></Field>
          <Field label="Completion date"><Input type="date" value={completionDate} onChange={(event) => setCompletionDate(event.target.value)} /></Field>
          <Field label="Issue date"><Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} /></Field>
          <Field label="Remarks"><Input placeholder="Optional" value={remarks} onChange={(event) => setRemarks(event.target.value)} /></Field>
          <div className="flex items-end"><Button className="w-full" onClick={() => create.mutate()} disabled={!enrollmentId || !completionDate || !issueDate || create.isPending}><Plus className="h-4 w-4" /> Generate</Button></div>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search certificate, student, code" />
        </div>
        {certificates.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {certificates.data && certificates.data.data.length > 0 ? <DataTable columns={columns} data={certificates.data.data} /> : null}
        {certificates.data && certificates.data.data.length === 0 ? <EmptyState icon={Award} title="No certificates found" description="Generated course completion certificates will appear here." /> : null}
      </section>
    </>
  );
}
