import { CertificatePrintClient } from "./certificate-print-client";

export function generateStaticParams() {
  return Array.from({ length: 200 }, (_, index) => ({ id: String(index + 1) }));
}

export default async function CertificatePrintPage({ params }: PageProps<"/certificates/[id]">) {
  const { id } = await params;
  return <CertificatePrintClient id={id} />;
}
