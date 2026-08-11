import { apiClient, type ApiResponse } from "@/lib/api/client";

export type CourseStatus = "active" | "inactive";
export type DurationUnit = "days" | "weeks" | "months" | null;

export type Course = {
  id: number;
  institute_id: number;
  name: string;
  code: string | null;
  description: string | null;
  duration_value: number | null;
  duration_unit: DurationUnit;
  standard_fee: string;
  admission_fee: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
};

export type CoursePayload = Omit<Course, "id" | "institute_id" | "created_at" | "updated_at" | "standard_fee" | "admission_fee"> & {
  standard_fee: number;
  admission_fee: number;
};

export async function getCourses(params: { search?: string; status?: string }) {
  const response = await apiClient.get<ApiResponse<Course[]>>("/courses", { params });
  return response.data;
}

export async function getCourse(id: number) {
  const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
  return response.data.data;
}

export async function createCourse(payload: CoursePayload) {
  const response = await apiClient.post<ApiResponse<Course>>("/courses", payload);
  return response.data.data;
}

export async function updateCourse(id: number, payload: CoursePayload) {
  const response = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, payload);
  return response.data.data;
}
