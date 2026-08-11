import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Batch } from "@/features/batches/batches-api";
import type { Course } from "@/features/courses/courses-api";
import type { Student } from "@/features/students/students-api";

export type Enrollment = {
  id: number; enrollment_date: string; agreed_course_fee: string; admission_fee: string;
  discount_type: "fixed" | "percentage" | null; discount_value: string; final_course_fee: string;
  status: "active" | "completed" | "dropped" | "cancelled"; notes: string | null;
  student: Student; course: Course; batch: Batch;
};

export type EnrollmentPayload = {
  student_id?: number;
  student?: { first_name: string; last_name?: string | null; phone: string; joining_date: string; status: "active" };
  course_id: number; batch_id: number; enrollment_date: string; agreed_course_fee: number; admission_fee: number;
  discount_type: "fixed" | "percentage" | null; discount_value: number; status: "active"; notes: string | null;
};

export async function createEnrollment(payload: EnrollmentPayload) {
  const response = await apiClient.post<ApiResponse<Enrollment>>("/enrollments", payload);
  return response.data.data;
}
