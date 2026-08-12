"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/data/data-table";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getPayments, receivePayment, type Payment } from "./payments-api";

const methods = ["cash","bank_transfer","jazzcash","easypaisa","other"];
const label = (v: string) => v.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const money = (v: string | number) => `PKR ${Number(v).toLocaleString("en-PK")}`;
export function PaymentsPage() {
  const [search,setSearch]=useState(""); const [method,setMethod]=useState(""); const [date,setDate]=useState("");
  const [enrollmentId,setEnrollmentId]=useState(""); const [installmentId,setInstallmentId]=useState(""); const [amount,setAmount]=useState(0); const [paymentMethod,setPaymentMethod]=useState("cash");
  const [paymentDate,setPaymentDate]=useState(new Date().toISOString().slice(0,10));
  const debouncedSearch=useDebouncedValue(search.trim());
  const qc=useQueryClient(); const q=useQuery({queryKey:["payments",debouncedSearch,method,date],queryFn:()=>getPayments({search:debouncedSearch,method,date})});
  const m=useMutation({mutationFn:receivePayment,onSuccess:(p)=>{["payments","fees","dashboard","alerts","reports"].forEach((key)=>qc.invalidateQueries({queryKey:[key]}));toast.success(`Receipt ${p.receipt_number} created.`)},onError:()=>toast.error("Payment could not be received. Check balances.")});
  const columns: Column<Payment>[]=[{key:"receipt_number",header:"Receipt"},{key:"student",header:"Student",render:r=>r.student?.full_name},{key:"amount",header:"Amount",render:r=>money(r.amount)},{key:"payment_method",header:"Method",render:r=>label(r.payment_method)},{key:"payment_date",header:"Date"},{key:"actions",header:"",render:r=><Button asChild variant="outline" size="sm"><Link href={`/payments/receipts/${r.id}`}><Printer className="h-4 w-4"/> Receipt</Link></Button>}];
  return <><PageHeader title="Payments" description="Receive payments, view history, and print receipts."/>
  <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-950">Receive Payment</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6"><Field label="Enrollment ID"><Input placeholder="e.g. 102" value={enrollmentId} onChange={e=>setEnrollmentId(e.target.value)}/></Field><Field label="Installment ID" hint="Leave empty for general payment."><Input placeholder="Optional" value={installmentId} onChange={e=>setInstallmentId(e.target.value)}/></Field><Field label="Amount"><Input type="number" min="1" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></Field><Field label="Payment date"><Input type="date" value={paymentDate} onChange={e=>setPaymentDate(e.target.value)}/></Field><Field label="Method"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>{methods.map(x=><option key={x} value={x}>{label(x)}</option>)}</select></Field><div className="flex items-end"><Button className="w-full" onClick={()=>m.mutate({enrollment_id:Number(enrollmentId),installment_id:installmentId?Number(installmentId):null,amount,payment_date:paymentDate,payment_method:paymentMethod})} disabled={!enrollmentId||amount<=0||m.isPending}><Plus className="h-4 w-4"/> Receive</Button></div></div></section>
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 grid gap-3 md:grid-cols-3"><Field label="Search payments"><SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search receipt, student, code, phone"/></Field><Field label="Payment method"><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={method} onChange={e=>setMethod(e.target.value)}><option value="">All methods</option>{methods.map(x=><option key={x} value={x}>{label(x)}</option>)}</select></Field><Field label="Payment date"><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field></div>{q.data&&q.data.data.length>0?<DataTable columns={columns} data={q.data.data}/>:<EmptyState icon={Printer} title="No payments found" description="Received payments and receipts will appear here."/>}</section></>;
}
