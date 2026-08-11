import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { FeeInstallment } from "@/features/fees/fees-api";
import type { Student } from "@/features/students/students-api";

export type Payment = { id: number; receipt_number: string; amount: string; payment_date: string; payment_method: string; reference_number: string | null; notes: string | null; student: Student; enrollment: Enrollment; installment?: FeeInstallment | null; receiver?: { name: string } };
export async function getPayments(params: Record<string,string>) { const r = await apiClient.get<ApiResponse<Payment[]>>("/payments", { params }); return r.data; }
export async function receivePayment(payload: { enrollment_id: number; installment_id?: number | null; amount: number; payment_date: string; payment_method: string; reference_number?: string | null; notes?: string | null }) { const r = await apiClient.post<ApiResponse<Payment>>("/payments", payload); return r.data.data; }
export async function getReceipt(id: number) { const r = await apiClient.get<ApiResponse<{ payment: Payment; institute: { name: string; logo_url?: string | null; receipt_footer?: string | null }; remaining_balance: string }>>(`/payments/${id}`); return r.data.data; }
