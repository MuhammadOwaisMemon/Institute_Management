"use client";

import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReceipt } from "@/features/payments/payments-api";

const money=(v:string)=>`PKR ${Number(v).toLocaleString("en-PK")}`;
export default function ReceiptPage({params}:{params:{id:string}}){
 const q=useQuery({queryKey:["receipt",params.id],queryFn:()=>getReceipt(Number(params.id))});
 if(!q.data)return <div className="p-8">Loading...</div>; const {payment,institute,remaining_balance}=q.data;
 return <main className="mx-auto max-w-3xl bg-white p-8 text-slate-950 print:p-0"><style>{`@media print{button{display:none}.receipt{box-shadow:none;border:0}body{background:white}}`}</style><div className="mb-4 flex justify-end"><Button onClick={()=>window.print()}><Printer className="h-4 w-4"/> Print</Button></div><section className="receipt rounded-xl border border-slate-200 p-8 shadow-sm"><div className="flex justify-between border-b pb-5"><div><h1 className="text-2xl font-bold">{institute.name}</h1><p className="text-sm text-slate-500">Payment Receipt</p></div><div className="text-right"><p className="text-sm text-slate-500">Receipt No.</p><p className="text-xl font-semibold">{payment.receipt_number}</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2">{[["Student",payment.student.full_name],["Student Code",payment.student.student_code],["Course",payment.enrollment.course.name],["Batch",payment.enrollment.batch.name],["Amount",money(payment.amount)],["Method",payment.payment_method.replace("_"," ")],["Payment Date",payment.payment_date],["Remaining Balance",money(remaining_balance)],["Received By",payment.receiver?.name||"Staff"]].map(([k,v])=><div key={k} className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">{k}</p><p className="mt-1 font-semibold">{v}</p></div>)}</div><p className="mt-8 border-t pt-5 text-center text-sm text-slate-500">{institute.receipt_footer||"Thank you for your payment."}</p></section></main>
}
