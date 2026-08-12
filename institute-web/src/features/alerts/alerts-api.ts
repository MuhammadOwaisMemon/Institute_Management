import { apiClient, type ApiResponse } from "@/lib/api/client";

export type InternalAlert = {
  key: string;
  type: "fee_overdue" | "installment_due_today" | "batch_starting_soon" | "batch_nearing_completion";
  title: string;
  message: string;
  date: string | null;
  href: string;
  read_at: string | null;
  is_read: boolean;
};

export type AlertsResponse = {
  unread_count: number;
  alerts: InternalAlert[];
};

export async function getAlerts() {
  const response = await apiClient.get<ApiResponse<AlertsResponse>>("/alerts");
  return response.data.data;
}

export async function markAlertRead(key: string) {
  await apiClient.post<ApiResponse<null>>("/alerts/read", { key });
}
