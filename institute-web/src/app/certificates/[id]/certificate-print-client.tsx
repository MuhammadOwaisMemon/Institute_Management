"use client";

import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCertificate } from "@/features/certificates/certificates-api";

export function CertificatePrintClient({ id }: { id: string }) {
  const certificate = useQuery({ queryKey: ["certificate", id], queryFn: () => getCertificate(Number(id)) });

  if (!certificate.data) {
    return <main className="p-8">Loading...</main>;
  }

  const { certificate: item, institute } = certificate.data;
  const logo = institute.logo_url ? assetUrl(institute.logo_url) : null;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950 print:bg-white print:p-0">
      <style>{`@media print{button{display:none}.cert{box-shadow:none;border:0;width:100%;min-height:100vh}.no-print{display:none}}`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-5xl justify-end">
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
      </div>
      <section className="cert mx-auto max-w-5xl border border-slate-200 bg-white p-12 shadow-sm">
        <div className="border-4 border-double border-slate-300 p-10 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt={institute.name} className="max-h-20 max-w-20 object-contain" /> : <span className="text-3xl font-bold">{institute.name.slice(0, 1)}</span>}
          </div>
          <h1 className="mt-5 text-3xl font-bold uppercase tracking-wide">{institute.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{[institute.address, institute.city].filter(Boolean).join(", ")}</p>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Certificate of Completion</p>
          <p className="mt-8 text-lg text-slate-600">This is to certify that</p>
          <h2 className="mt-4 border-b border-slate-300 pb-3 text-4xl font-semibold">{item.student?.full_name}</h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
            has successfully completed the course <span className="font-semibold text-slate-950">{item.course?.name}</span>
            {item.enrollment?.batch?.name ? <> in <span className="font-semibold text-slate-950">{item.enrollment.batch.name}</span></> : null}.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <Info label="Completion Date" value={formatDate(item.completion_date)} />
            <Info label="Issue Date" value={formatDate(item.issue_date)} />
            <Info label="Certificate No." value={item.certificate_number} />
          </div>
          {item.remarks ? <p className="mt-8 text-sm text-slate-500">{item.remarks}</p> : null}
          <div className="mt-20 flex justify-end">
            <div className="w-56 border-t border-slate-400 pt-3 text-center text-sm font-semibold text-slate-700">Authorized Signature</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-950">{value}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function assetUrl(path: string) {
  if (path.startsWith("http")) return path;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  return `${apiUrl.replace(/\/api\/?$/, "")}${path}`;
}
