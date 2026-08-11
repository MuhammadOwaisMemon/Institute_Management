import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Batch, Weekday } from "@/features/batches/batches-api";
import type { Teacher } from "@/features/teachers/teachers-api";

export type ScheduleConflict = {
  type: "teacher" | "room";
  message: string;
  days: Weekday[];
  batches: Batch[];
};

export type TeacherSchedule = {
  teacher: Teacher | null;
  classes: Batch[];
};

export type ScheduleResponse = {
  today: Batch[];
  weekly: Record<Weekday, Batch[]>;
  teacher_schedule: TeacherSchedule[];
  conflicts: ScheduleConflict[];
};

export async function getSchedule(params: { teacher_id?: string; course_id?: string; batch_id?: string; day?: string }) {
  const response = await apiClient.get<ApiResponse<ScheduleResponse>>("/schedule", { params });
  return response.data.data;
}
