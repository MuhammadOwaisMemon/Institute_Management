"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus, Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getBatches } from "@/features/batches/batches-api";
import { createExam, getBatchResults, getExams, getStudentResultHistory, loadExamStudents, saveExamResults, type Exam, type ExamResult, type ExamStudentRow } from "./exams-api";

type MarkRecord = { obtained_marks: string; grade: string; remarks: string };

export function ExamsPage() {
  const [batchId, setBatchId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const batches = useQuery({ queryKey: ["batches", "exams"], queryFn: () => getBatches({ status: "active" }) });
  const exams = useQuery({ queryKey: ["exams", batchId], queryFn: () => getExams({ batch_id: batchId }), enabled: Boolean(batchId) });
  const selectedExam = useMemo(() => exams.data?.data.find((exam) => String(exam.id) === selectedExamId), [exams.data, selectedExamId]);
  const studentHistory = useQuery({ queryKey: ["student-results", studentId], queryFn: () => getStudentResultHistory(studentId), enabled: Boolean(studentId) });
  const batchResults = useQuery({ queryKey: ["batch-results", batchId], queryFn: () => getBatchResults(batchId), enabled: Boolean(batchId) });

  return (
    <>
      <PageHeader title="Exams & Results" description="Create tests, load enrolled students, and enter marks quickly." />
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <Field label="Batch"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={batchId} onChange={(event) => { setBatchId(event.target.value); setSelectedExamId(""); }}>
            <option value="">Select batch</option>
            {batches.data?.data.map((batch) => <option key={batch.id} value={batch.id}>{batch.name} - {batch.course?.name}</option>)}
          </select></Field>
          <Field label="Exam"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={selectedExamId} onChange={(event) => setSelectedExamId(event.target.value)} disabled={!batchId}>
            <option value="">Select exam</option>
            {exams.data?.data.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} - {formatDate(exam.exam_date)}</option>)}
          </select></Field>
        </div>
      </section>

      <CreateExamForm batchId={batchId} onCreated={(exam) => { setSelectedExamId(String(exam.id)); exams.refetch(); }} />

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-950">Marks Entry</h2>
        {selectedExam ? <MarksEditor exam={selectedExam} /> : <EmptyState icon={ClipboardList} title="Select an exam" description="Choose a batch and exam to load enrolled students for marks entry." />}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-950">Student Result History</h2>
            <div className="flex gap-2">
              <Input placeholder="Student ID" value={studentId} onChange={(event) => setStudentId(event.target.value)} />
              <Button variant="outline" disabled={!studentId} onClick={() => studentHistory.refetch()}><Search className="h-4 w-4" /></Button>
            </div>
          </div>
          <ResultList results={studentHistory.data ?? []} emptyTitle="No student results" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-950">Batch Results</h2>
          {batchResults.isLoading ? <LoadingSkeleton className="h-48" /> : <ResultList results={batchResults.data?.data ?? []} emptyTitle="No batch results" />}
        </div>
      </section>
    </>
  );
}

function CreateExamForm({ batchId, onCreated }: { batchId: string; onCreated: (exam: Exam) => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10));
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState("");
  const [status, setStatus] = useState<Exam["status"]>("scheduled");
  const mutation = useMutation({
    mutationFn: () => createExam({ batch_id: Number(batchId), title, exam_date: examDate, total_marks: totalMarks, passing_marks: passingMarks ? Number(passingMarks) : null, status }),
    onSuccess: (exam) => {
      toast.success("Exam created.");
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      onCreated(exam);
    },
    onError: () => toast.error("Exam could not be created."),
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">Create Exam/Test</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Field label="Exam title" className="xl:col-span-2"><Input placeholder="e.g. Monthly Test" value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
        <Field label="Exam date"><Input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} /></Field>
        <Field label="Total marks"><Input type="number" min="1" value={totalMarks} onChange={(event) => setTotalMarks(Number(event.target.value))} /></Field>
        <Field label="Passing marks"><Input placeholder="Optional" type="number" min="0" value={passingMarks} onChange={(event) => setPassingMarks(event.target.value)} /></Field>
        <Field label="Status"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as Exam["status"])}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select></Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={!batchId || !title || totalMarks <= 0 || mutation.isPending}><Plus className="h-4 w-4" /> Create</Button>
      </div>
    </section>
  );
}

function MarksEditor({ exam }: { exam: Exam }) {
  const rows = useQuery({ queryKey: ["exam-students", exam.id], queryFn: () => loadExamStudents(exam.id) });
  return (
    <>
      <div className="mb-4">
        <p className="font-semibold text-slate-950">{exam.title}</p>
        <p className="text-sm text-slate-500">{formatDate(exam.exam_date)} | {exam.batch?.name}</p>
      </div>
      {rows.isLoading ? <LoadingSkeleton className="h-64" /> : null}
      {rows.data && rows.data.length > 0 ? <MarksTable key={`${exam.id}-${rows.dataUpdatedAt}`} exam={exam} rows={rows.data} onSaved={() => rows.refetch()} /> : null}
      {rows.data && rows.data.length === 0 ? <EmptyState icon={ClipboardList} title="No enrolled students" description="Active enrollments in this exam batch will appear here." /> : null}
    </>
  );
}

function MarksTable({ exam, rows, onSaved }: { exam: Exam; rows: ExamStudentRow[]; onSaved: () => void }) {
  const [initialRecords] = useState(() => {
    const next: Record<number, MarkRecord> = {};
    rows.forEach((row) => {
      next[row.student.id] = { obtained_marks: row.result?.obtained_marks ?? "", grade: row.result?.grade ?? "", remarks: row.result?.remarks ?? "" };
    });
    return next;
  });
  const [records, setRecords] = useState<Record<number, MarkRecord>>(initialRecords);
  const [dirty, setDirty] = useState(false);
  const mutation = useMutation({
    mutationFn: () => saveExamResults(exam.id, Object.entries(records).filter(([, value]) => value.obtained_marks !== "").map(([studentId, value]) => ({ student_id: Number(studentId), obtained_marks: Number(value.obtained_marks), grade: value.grade || null, remarks: value.remarks || null }))),
    onSuccess: () => { toast.success("Results saved."); setDirty(false); onSaved(); },
    onError: () => toast.error("Marks must be between 0 and total marks."),
  });

  function update(studentId: number, key: keyof MarkRecord, value: string) {
    setRecords((current) => ({ ...current, [studentId]: { ...(current[studentId] ?? initialRecords[studentId]), [key]: value } }));
    setDirty(true);
  }

  const columns: Column<ExamStudentRow & { id: number }>[] = [
    { key: "code", header: "Code", render: (row) => row.student.student_code },
    { key: "student", header: "Student", render: (row) => row.student.full_name },
    { key: "obtained", header: `Marks / ${Number(exam.total_marks).toLocaleString("en-PK")}`, render: (row) => <Input type="number" min="0" max={Number(exam.total_marks)} value={(records[row.student.id] ?? initialRecords[row.student.id])?.obtained_marks ?? ""} onChange={(event) => update(row.student.id, "obtained_marks", event.target.value)} /> },
    { key: "grade", header: "Grade", render: (row) => <Input value={(records[row.student.id] ?? initialRecords[row.student.id])?.grade ?? ""} onChange={(event) => update(row.student.id, "grade", event.target.value)} /> },
    { key: "remarks", header: "Remarks", render: (row) => <Input value={(records[row.student.id] ?? initialRecords[row.student.id])?.remarks ?? ""} onChange={(event) => update(row.student.id, "remarks", event.target.value)} /> },
    { key: "percentage", header: "Percentage", render: (row) => row.result ? `${row.result.percentage}%` : "-" },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={!dirty || mutation.isPending}><Save className="h-4 w-4" /> Save Marks</Button>
      </div>
      <DataTable columns={columns} data={rows.map((row) => ({ ...row, id: row.student.id }))} />
    </>
  );
}

function ResultList({ results, emptyTitle }: { results: ExamResult[]; emptyTitle: string }) {
  if (!results.length) {
    return <EmptyState icon={ClipboardList} title={emptyTitle} description="Saved exam results will appear here." />;
  }

  return (
    <div className="space-y-3">
      {results.slice(0, 8).map((result) => (
        <div key={result.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{result.student?.full_name ?? "Student"}</p>
              <p className="mt-1 text-xs text-slate-500">{result.exam?.title ?? "Exam"} | {result.exam?.batch?.name ?? "Batch"}</p>
            </div>
            <p className="text-sm font-semibold text-slate-950">{result.obtained_marks} ({result.percentage}%)</p>
          </div>
          {result.grade || result.remarks ? <p className="mt-2 text-xs text-slate-500">{result.grade ? `Grade ${result.grade}` : ""} {result.remarks ?? ""}</p> : null}
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
