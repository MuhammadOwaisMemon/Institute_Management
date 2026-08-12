import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { Attendance } from "@/features/attendance/attendance-api";
import type { Payment } from "@/features/payments/payments-api";
import type { Student } from "@/features/students/students-api";

export type ReportMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  total_amount?: string;
  total_final_fee?: string;
  total_remaining?: string;
  present?: number;
  absent?: number;
  leave?: number;
};

export type ReportResponse<T> = {
  data: T[];
  meta: ReportMeta;
};

export type PendingFeeReportRow = {
  id: number;
  student: string;
  course: string;
  batch: string;
  total_fee: string;
  paid: string;
  remaining: string;
  next_due_date: string | null;
};

export type ReportType = "students" | "admissions" | "batch-students" | "fee-collection" | "pending-fees" | "attendance";

export async function getStudentReport(params: Record<string, string>) {
  return getReport<Student>("/reports/students", params);
}

export async function getAdmissionReport(params: Record<string, string>) {
  return getReport<Enrollment>("/reports/admissions", params);
}

export async function getBatchStudentsReport(params: Record<string, string>) {
  return getReport<Enrollment>("/reports/batch-students", params);
}

export async function getFeeCollectionReport(params: Record<string, string>) {
  return getReport<Payment>("/reports/fee-collection", params);
}

export async function getPendingFeeReport(params: Record<string, string>) {
  return getReport<PendingFeeReportRow>("/reports/pending-fees", params);
}

export async function getAttendanceReport(params: Record<string, string>) {
  return getReport<Attendance>("/reports/attendance", params);
}

export async function exportReport(type: ReportType, params: Record<string, string>) {
  const response = await apiClient.get<Blob>(`/reports/${type}/export`, { params, responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}-report.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function getReport<T>(url: string, params: Record<string, string>): Promise<ReportResponse<T>> {
  const response = await apiClient.get<ApiResponse<T[]>>(url, { params });
  return { data: response.data.data, meta: response.data.meta as ReportMeta };
}
