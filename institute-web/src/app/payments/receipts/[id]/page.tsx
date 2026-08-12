import { ReceiptPrintClient } from "./receipt-print-client";

export function generateStaticParams() {
  return Array.from({ length: 200 }, (_, index) => ({ id: String(index + 1) }));
}

export default async function ReceiptPage({ params }: PageProps<"/payments/receipts/[id]">) {
  const { id } = await params;
  return <ReceiptPrintClient id={id} />;
}
