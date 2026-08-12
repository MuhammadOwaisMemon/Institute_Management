"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookOpen, Camera, ClipboardCheck, CreditCard, Edit, Receipt, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { getStudentCertificates } from "@/features/certificates/certificates-api";
import { StudentFormDialog } from "./student-form-dialog";
import { getStudent, uploadStudentPhoto, type StudentStatus } from "./students-api";

const tabs = ["Overview", "Courses", "Attendance", "Fees", "Payments", "Certificates"];
const map: Record<StudentStatus, "active" | "inactive" | "danger"> = { active: "active", completed: "inactive", dropped: "danger", inactive: "inactive" };
export function StudentProfilePage({ id }: { id: number }) {
  const [tab, setTab] = useState("Overview"); const qc = useQueryClient();
  const q = useQuery({ queryKey: ["student", id], queryFn: () => getStudent(id) });
  const certificates = useQuery({ queryKey: ["student-certificates", id], queryFn: () => getStudentCertificates(id), enabled: tab === "Certificates" });
  const photo = useMutation({ mutationFn: (file: File) => uploadStudentPhoto(id, file), onSuccess: (s) => { qc.setQueryData(["student", id], s); toast.success("Photo updated."); }, onError: () => toast.error("Could not upload photo.") });
  if (q.isLoading) return <LoadingSkeleton className="h-96" />;
  if (q.isError || !q.data) return <ErrorState title="Student not found" description="This student profile could not be loaded." />;
  const s = q.data;
  return <>
    <PageHeader title={s.full_name} description={`${s.student_code} | ${s.phone}`} actions={<StudentFormDialog student={s}><Button><Edit className="h-4 w-4" /> Edit student</Button></StudentFormDialog>} />
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">{s.photo_url ? <Image src={s.photo_url} alt={s.full_name} fill className="object-cover" /> : <div className="flex h-full items-center justify-center"><UserRound className="h-9 w-9 text-slate-400" /></div>}</div>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-slate-950">{s.full_name}</h2><StatusBadge status={map[s.status]} label={s.status} /></div><p className="mt-1 text-sm text-slate-500">{s.student_code} | {s.phone}</p></div>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium"><Camera className="h-4 w-4" /> Upload photo<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && photo.mutate(e.target.files[0])} /></label>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium ${tab === t ? "border-b-2 border-slate-950 text-slate-950" : "text-slate-500"}`}>{t}</button>)}</div>
      <div className="mt-6">
        {tab === "Overview" ? <div className="grid gap-4 md:grid-cols-3">{[
          ["Guardian", s.father_guardian_name || "Not set"], ["Gender", s.gender || "Not set"], ["DOB", s.date_of_birth || "Not set"], ["CNIC/B-Form", s.cnic_bform || "Not set"], ["Email", s.email || "Not set"], ["City", s.city || "Not set"], ["Guardian Phone", s.guardian_phone || "Not set"], ["Alternate Phone", s.alternate_phone || "Not set"], ["Joining", s.joining_date],
        ].map(([k,v]) => <div key={k} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-medium uppercase text-slate-500">{k}</p><p className="mt-2 text-sm font-semibold text-slate-950">{v}</p></div>)}</div> : null}
        {tab === "Courses" ? <EmptyState icon={BookOpen} title="No course enrollments yet" description="Students will join courses using enrollments." /> : null}
        {tab === "Attendance" ? <EmptyState icon={ClipboardCheck} title="No attendance yet" description="Attendance will appear after the attendance module is added." /> : null}
        {tab === "Fees" ? <EmptyState icon={Receipt} title="No fee records yet" description="Fee schedules will appear after enrollment and fee workflows are added." /> : null}
        {tab === "Payments" ? <EmptyState icon={CreditCard} title="No payments yet" description="Payments will appear after payment collection is implemented." /> : null}
        {tab === "Certificates" ? <CertificateHistory certificates={certificates.data ?? []} isLoading={certificates.isLoading} /> : null}
      </div>
    </section>
  </>;
}

function CertificateHistory({ certificates, isLoading }: { certificates: { id: number; certificate_number: string; course?: { name: string }; completion_date: string; issue_date: string }[]; isLoading: boolean }) {
  if (isLoading) {
    return <LoadingSkeleton className="h-40" />;
  }

  if (!certificates.length) {
    return <EmptyState icon={Award} title="No certificates yet" description="Generated course completion certificates will appear here." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {certificates.map((certificate) => (
        <Link key={certificate.id} href={`/certificates/${certificate.id}`} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
          <p className="text-sm font-semibold text-slate-950">{certificate.certificate_number}</p>
          <p className="mt-1 text-sm text-slate-500">{certificate.course?.name ?? "Course"}</p>
          <p className="mt-3 text-xs text-slate-500">Completed {certificate.completion_date} | Issued {certificate.issue_date}</p>
        </Link>
      ))}
    </div>
  );
}
