import { apiClient, type ApiResponse } from "@/lib/api/client";

export type StudentStatus = "active" | "completed" | "dropped" | "inactive";
export type Student = {
  id: number; institute_id: number; student_code: string; first_name: string; last_name: string | null; full_name: string;
  father_guardian_name: string | null; gender: "male" | "female" | "other" | null; date_of_birth: string | null;
  cnic_bform: string | null; phone: string; alternate_phone: string | null; guardian_phone: string | null;
  email: string | null; address: string | null; city: string | null; photo: string | null; photo_url: string | null;
  joining_date: string; status: StudentStatus; notes: string | null;
};
export type StudentPayload = Omit<Student, "id" | "institute_id" | "student_code" | "full_name" | "photo" | "photo_url">;

export async function getStudents(params: { search?: string; status?: string }) {
  const response = await apiClient.get<ApiResponse<Student[]>>("/students", { params });
  return response.data;
}
export async function getStudent(id: number) {
  const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
  return response.data.data;
}
export async function createStudent(payload: StudentPayload) {
  const response = await apiClient.post<ApiResponse<Student>>("/students", payload);
  return response.data.data;
}
export async function updateStudent(id: number, payload: StudentPayload) {
  const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, payload);
  return response.data.data;
}
export async function uploadStudentPhoto(id: number, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  const response = await apiClient.post<ApiResponse<Student>>(`/students/${id}/photo`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.data;
}
