import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Course } from "@/features/courses/courses-api";
import type { Teacher } from "@/features/teachers/teachers-api";

export type BatchStatus = "upcoming" | "active" | "completed" | "cancelled";
export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type Batch = {
  id: number;
  institute_id: number;
  course_id: number;
  teacher_id: number | null;
  name: string;
  batch_code: string | null;
  start_date: string;
  expected_end_date: string | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  room: string | null;
  weekdays: Weekday[];
  status: BatchStatus;
  notes: string | null;
  course?: Course;
  teacher?: Teacher | null;
};

export type BatchPayload = Omit<Batch, "id" | "institute_id" | "course" | "teacher">;

export async function getBatches(params: { search?: string; status?: string; course_id?: string; teacher_id?: string }) {
  const response = await apiClient.get<ApiResponse<Batch[]>>("/batches", { params });
  return response.data;
}

export async function getBatch(id: number) {
  const response = await apiClient.get<ApiResponse<Batch>>(`/batches/${id}`);
  return response.data.data;
}

export async function createBatch(payload: BatchPayload) {
  const response = await apiClient.post<ApiResponse<Batch>>("/batches", payload);
  return response.data.data;
}

export async function updateBatch(id: number, payload: BatchPayload) {
  const response = await apiClient.put<ApiResponse<Batch>>(`/batches/${id}`, payload);
  return response.data.data;
}
