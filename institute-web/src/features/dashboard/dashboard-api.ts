import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { Batch } from "@/features/batches/batches-api";
import type { FeeInstallment } from "@/features/fees/fees-api";
import type { Payment } from "@/features/payments/payments-api";

export type DashboardKpis = {
  total_students: number;
  active_students: number;
  active_batches: number;
  todays_classes: number;
  this_month_collection: string;
  pending_fees: string;
};

export type MonthlyFeeCollection = {
  month: string;
  label: string;
  amount: string;
};

export type DashboardResponse = {
  kpis: DashboardKpis;
  today_classes: Batch[];
  recent_admissions: Enrollment[];
  recent_payments: Payment[];
  pending_fees: FeeInstallment[];
  monthly_fee_collection: MonthlyFeeCollection[];
};

export async function getDashboard() {
  const response = await apiClient.get<ApiResponse<DashboardResponse>>("/dashboard");
  return response.data.data;
}
