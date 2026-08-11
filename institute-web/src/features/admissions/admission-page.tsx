"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBatches } from "@/features/batches/batches-api";
import { getCourses } from "@/features/courses/courses-api";
import { getStudents } from "@/features/students/students-api";
import { createEnrollment, type Enrollment } from "./admissions-api";

function money(value: number | string) { return `PKR ${Number(value).toLocaleString("en-PK")}`; }

export function AdmissionPage() {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [courseFee, setCourseFee] = useState(0);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage" | "">("");
  const [discountValue, setDiscountValue] = useState(0);
  const [summary, setSummary] = useState<Enrollment | null>(null);
  const students = useQuery({ queryKey: ["students", search, "admission"], queryFn: () => getStudents({ search }), enabled: mode === "existing" });
  const courses = useQuery({ queryKey: ["courses", "admission"], queryFn: () => getCourses({ status: "active" }) });
  const batches = useQuery({ queryKey: ["batches", courseId, "admission"], queryFn: () => getBatches({ status: "active", course_id: courseId }), enabled: Boolean(courseId) });
  const selectedCourse = courses.data?.data.find((c) => String(c.id) === courseId);
  const finalPayable = useMemo(() => {
    const subtotal = Number(courseFee) + Number(admissionFee);
    const discount = discountType === "percentage" ? subtotal * Number(discountValue) / 100 : Number(discountValue || 0);
    return Math.max(0, subtotal - discount);
  }, [admissionFee, courseFee, discountType, discountValue]);
  const mutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: (data) => { setSummary(data); toast.success("Admission confirmed."); },
    onError: () => toast.error("Could not confirm enrollment."),
  });
  function chooseCourse(id: string) {
    setCourseId(id); setBatchId("");
    const course = courses.data?.data.find((c) => String(c.id) === id);
    setCourseFee(Number(course?.standard_fee ?? 0)); setAdmissionFee(Number(course?.admission_fee ?? 0));
  }
  function submit() {
    mutation.mutate({
      ...(mode === "existing" ? { student_id: Number(studentId) } : { student: { first_name: firstName, last_name: lastName || null, phone, joining_date: new Date().toISOString().slice(0, 10), status: "active" } }),
      course_id: Number(courseId), batch_id: Number(batchId), enrollment_date: new Date().toISOString().slice(0, 10),
      agreed_course_fee: Number(courseFee), admission_fee: Number(admissionFee), discount_type: discountType || null,
      discount_value: Number(discountValue || 0), status: "active", notes: null,
    });
  }
  return <>
    <PageHeader title="Admissions" description="Enroll an existing or new student into a course batch." />
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-2"><Button variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}><Search className="h-4 w-4" /> Existing student</Button><Button variant={mode === "new" ? "default" : "outline"} onClick={() => setMode("new")}><UserPlus className="h-4 w-4" /> New student</Button></div>
        {mode === "existing" ? <div className="grid gap-3 md:grid-cols-[1fr_220px]"><Input placeholder="Search by name, code, or phone" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={studentId} onChange={(e) => setStudentId(e.target.value)}><option value="">Select student</option>{students.data?.data.map((s) => <option key={s.id} value={s.id}>{s.student_code} - {s.full_name}</option>)}</select></div> : <div className="grid gap-3 md:grid-cols-3"><Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /><Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} /><Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>}
        <div className="grid gap-3 md:grid-cols-2"><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={courseId} onChange={(e) => chooseCourse(e.target.value)}><option value="">Select course</option>{courses.data?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={batchId} onChange={(e) => setBatchId(e.target.value)}><option value="">Select batch</option>{batches.data?.data.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        <div className="grid gap-3 md:grid-cols-4"><Input type="number" min="0" value={courseFee} onChange={(e) => setCourseFee(Number(e.target.value))} /><Input type="number" min="0" value={admissionFee} onChange={(e) => setAdmissionFee(Number(e.target.value))} /><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={discountType} onChange={(e) => setDiscountType(e.target.value as typeof discountType)}><option value="">No discount</option><option value="fixed">Fixed amount</option><option value="percentage">Percentage</option></select><Input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} /></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Final payable preview: <span className="font-semibold text-slate-950">{money(finalPayable)}</span></div>
        <Button onClick={submit} disabled={mutation.isPending || !courseId || !batchId || (mode === "existing" ? !studentId : !firstName || !phone)}><CheckCircle2 className="h-4 w-4" /> Confirm enrollment</Button>
      </section>
      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-base font-semibold text-slate-950">Admission Summary</h2>{summary ? <div className="mt-5 space-y-3 text-sm"><p><b>Student:</b> {summary.student.full_name}</p><p><b>Course:</b> {summary.course.name}</p><p><b>Batch:</b> {summary.batch.name}</p><p><b>Fee:</b> {money(summary.agreed_course_fee)}</p><p><b>Discount:</b> {summary.discount_type || "none"} {Number(summary.discount_value) ? money(summary.discount_value) : ""}</p><p className="text-lg font-semibold"><b>Final payable:</b> {money(summary.final_course_fee)}</p><p><b>Date:</b> {summary.enrollment_date}</p></div> : <EmptyState icon={CheckCircle2} title="No admission yet" description={`Select student, course, batch, and fee to confirm. ${selectedCourse ? selectedCourse.name : ""}`} />}</aside>
    </div>
  </>;
}
