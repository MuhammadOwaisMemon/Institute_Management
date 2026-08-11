import { apiClient, type ApiResponse } from "@/lib/api/client";

export type TeacherStatus = "active" | "inactive";

export type Teacher = {
  id: number;
  institute_id: number;
  user_id: number | null;
  employee_code: string | null;
  first_name: string;
  last_name: string | null;
  full_name: string;
  gender: "male" | "female" | "other" | null;
  phone: string;
  email: string | null;
  cnic: string | null;
  address: string | null;
  joining_date: string | null;
  status: TeacherStatus;
  notes: string | null;
};

export type TeacherPayload = Omit<Teacher, "id" | "institute_id" | "full_name">;

export async function getTeachers(params: { search?: string; status?: string }) {
  const response = await apiClient.get<ApiResponse<Teacher[]>>("/teachers", { params });
  return response.data;
}

export async function getTeacher(id: number) {
  const response = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return response.data.data;
}

export async function createTeacher(payload: TeacherPayload) {
  const response = await apiClient.post<ApiResponse<Teacher>>("/teachers", payload);
  return response.data.data;
}

export async function updateTeacher(id: number, payload: TeacherPayload) {
  const response = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, payload);
  return response.data.data;
}
