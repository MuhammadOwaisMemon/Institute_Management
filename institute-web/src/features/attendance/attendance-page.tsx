"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ClipboardCheck, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBatches } from "@/features/batches/batches-api";
import { loadAttendanceStudents, saveAttendance, getAttendanceReport, type AttendanceRow, type AttendanceStatus } from "./attendance-api";

const statuses: AttendanceStatus[] = ["present","absent","leave"];
export function AttendancePage() {
  const [batchId,setBatchId]=useState(""); const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const batches=useQuery({queryKey:["batches","attendance"],queryFn:()=>getBatches({status:"active"})});
  const rows=useQuery({queryKey:["attendance",batchId,date],queryFn:()=>loadAttendanceStudents(batchId,date),enabled:Boolean(batchId&&date)});
  const report=useQuery({queryKey:["attendance-report",batchId,month],queryFn:()=>getAttendanceReport(batchId,month),enabled:Boolean(batchId&&month)});
  return <><PageHeader title="Attendance" description="Select a batch and date, then mark student attendance quickly."/>
  <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_180px]"><select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={batchId} onChange={e=>setBatchId(e.target.value)}><option value="">Select batch</option>{batches.data?.data.map(b=><option key={b.id} value={b.id}>{b.name} - {b.course?.name}</option>)}</select><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div></section>
  <AttendanceEditor key={`${batchId}-${date}-${rows.dataUpdatedAt}`} batchId={batchId} date={date} rows={rows.data} isLoading={rows.isLoading} onSaved={()=>{rows.refetch();report.refetch();}} />
  <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold text-slate-950">Monthly Report</h2><Input className="max-w-44" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div><div className="grid gap-3 md:grid-cols-3">{report.data?.map(r=><div key={r.student.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="font-semibold">{r.student.full_name}</p><p className="mt-1 text-sm text-slate-500">Present {r.present} | Absent {r.absent} | Leave {r.leave}</p><StatusBadge status={r.percentage>=75?"active":"pending"} label={`${r.percentage}%`} /></div>)}</div></section></>;
}

function AttendanceEditor({ batchId, date, rows, isLoading, onSaved }: { batchId: string; date: string; rows?: AttendanceRow[]; isLoading: boolean; onSaved: () => void }) {
  const [dirty,setDirty]=useState(false);
  const [records,setRecords]=useState<Record<number,{status:AttendanceStatus;remarks:string}>>(() => {
    const next: Record<number,{status:AttendanceStatus;remarks:string}> = {};
    rows?.forEach(r=>{next[r.student.id]={status:r.attendance?.status??"present",remarks:r.attendance?.remarks??""}});
    return next;
  });
  const save=useMutation({mutationFn:()=>saveAttendance({batch_id:Number(batchId),attendance_date:date,records:Object.entries(records).map(([student_id,r])=>({student_id:Number(student_id),status:r.status,remarks:r.remarks||null}))}),onSuccess:()=>{toast.success("Attendance saved.");setDirty(false);onSaved();},onError:()=>toast.error("Could not save attendance.")});
  function setStatus(id:number,status:AttendanceStatus){setRecords(v=>({...v,[id]:{...v[id],status}}));setDirty(true)}
  function markAll(){const next={...records}; Object.keys(next).forEach(id=>next[Number(id)].status="present"); setRecords(next); setDirty(true)}
  const columns:Column<AttendanceRow>[]=[{key:"code",header:"Code",render:r=>r.student.student_code},{key:"name",header:"Student",render:r=>r.student.full_name},{key:"status",header:"Status",render:r=><div className="flex gap-2">{statuses.map(s=><button key={s} onClick={()=>setStatus(r.student.id,s)} className={`rounded-lg px-3 py-1 text-xs font-medium ${records[r.student.id]?.status===s?"bg-slate-950 text-white":"bg-slate-100 text-slate-600"}`}>{s}</button>)}</div>},{key:"remarks",header:"Remarks",render:r=><Input value={records[r.student.id]?.remarks??""} onChange={e=>{setRecords(v=>({...v,[r.student.id]:{...v[r.student.id],remarks:e.target.value}}));setDirty(true)}}/>}];
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-end gap-3">{dirty?<span className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">Unsaved changes</span>:null}<Button variant="outline" onClick={markAll} disabled={!rows}><Check className="h-4 w-4"/> Mark All Present</Button><Button onClick={()=>save.mutate()} disabled={!dirty||save.isPending}><Save className="h-4 w-4"/> Save</Button></div>{isLoading?<LoadingSkeleton className="h-64"/>:null}{rows&&rows.length>0?<DataTable columns={columns} data={rows.map((r,i)=>({...r,id:r.student.id+i}))}/>:null}{rows&&rows.length===0?<EmptyState icon={ClipboardCheck} title="No enrolled students" description="Students with active enrollments in this batch/date will appear here."/>:null}</section>;
}
