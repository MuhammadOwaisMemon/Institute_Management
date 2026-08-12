import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { Course } from "@/features/courses/courses-api";
import type { Student } from "@/features/students/students-api";

export type Certificate = {
  id: number;
  institute_id: number;
  enrollment_id: number;
  student_id: number;
  course_id: number;
  certificate_number: string;
  issue_date: string;
  completion_date: string;
  remarks: string | null;
  student?: Student;
  course?: Course;
  enrollment?: Enrollment;
};

export type CertificatePrint = {
  certificate: Certificate;
  institute: {
    name: string;
    short_name?: string | null;
    logo_url?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  };
};

export async function getCertificates(params: Record<string, string>) {
  const response = await apiClient.get<ApiResponse<Certificate[]>>("/certificates", { params });
  return response.data;
}

export async function createCertificate(payload: { enrollment_id: number; issue_date: string; completion_date: string; remarks?: string | null }) {
  const response = await apiClient.post<ApiResponse<Certificate>>("/certificates", payload);
  return response.data.data;
}

export async function getCertificate(id: number) {
  const response = await apiClient.get<ApiResponse<CertificatePrint>>(`/certificates/${id}`);
  return response.data.data;
}

export async function getStudentCertificates(studentId: number) {
  const response = await apiClient.get<ApiResponse<Certificate[]>>(`/students/${studentId}/certificates`);
  return response.data.data;
}
