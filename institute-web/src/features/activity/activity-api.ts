import { apiClient, type ApiResponse } from "@/lib/api/client";

export type ActivityLog = {
  id: number;
  institute_id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: { id: number; name: string; email: string; role: string };
};

export type ActivityLogResponse = {
  data: ActivityLog[];
  meta?: { current_page?: number; per_page?: number; total?: number; last_page?: number };
};

export async function getActivityLogs(params: Record<string, string>) {
  const response = await apiClient.get<ApiResponse<ActivityLog[]>>("/settings/activity-logs", { params });
  return { data: response.data.data, meta: response.data.meta } as ActivityLogResponse;
}
