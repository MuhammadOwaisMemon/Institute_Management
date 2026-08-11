import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Enrollment } from "@/features/admissions/admissions-api";

export type InstallmentStatus = "pending" | "partially_paid" | "paid" | "overdue";
export type FeeInstallment = { id: number; enrollment_id: number; title: string; due_date: string; amount: string; paid_amount: string; status: InstallmentStatus; enrollment?: Enrollment };

export async function getFees(params: Record<string, string>) {
  const response = await apiClient.get<ApiResponse<FeeInstallment[]>>("/fees", { params });
  return response.data;
}
export async function createInstallment(payload: { enrollment_id: number; title: string; due_date: string; amount: number }) {
  const response = await apiClient.post<ApiResponse<FeeInstallment>>("/fees/installments", payload);
  return response.data.data;
}
export async function getEnrollmentFees(enrollmentId: number) {
  const response = await apiClient.get<ApiResponse<{ enrollment: Enrollment; total_fee: string; total_paid: string; remaining_balance: string; installments: FeeInstallment[] }>>(`/enrollments/${enrollmentId}/fees`);
  return response.data.data;
}
