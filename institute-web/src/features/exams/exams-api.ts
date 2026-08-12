import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Batch } from "@/features/batches/batches-api";
import type { Student } from "@/features/students/students-api";

export type ExamStatus = "scheduled" | "completed" | "cancelled";

export type Exam = {
  id: number;
  institute_id: number;
  batch_id: number;
  title: string;
  exam_date: string;
  total_marks: string;
  passing_marks: string | null;
  status: ExamStatus;
  batch?: Batch;
  results?: ExamResult[];
};

export type ExamResult = {
  id: number;
  institute_id: number;
  exam_id: number;
  student_id: number;
  obtained_marks: string;
  percentage: string;
  grade: string | null;
  remarks: string | null;
  exam?: Exam;
  student?: Student;
};

export type ExamStudentRow = { student: Student; result: ExamResult | null };

export async function getExams(params: Record<string, string>) {
  const response = await apiClient.get<ApiResponse<Exam[]>>("/exams", { params });
  return response.data;
}

export async function createExam(payload: { batch_id: number; title: string; exam_date: string; total_marks: number; passing_marks?: number | null; status: ExamStatus }) {
  const response = await apiClient.post<ApiResponse<Exam>>("/exams", payload);
  return response.data.data;
}

export async function loadExamStudents(examId: number) {
  const response = await apiClient.get<ApiResponse<ExamStudentRow[]>>(`/exams/${examId}/students`);
  return response.data.data;
}

export async function saveExamResults(examId: number, records: { student_id: number; obtained_marks: number; grade?: string | null; remarks?: string | null }[]) {
  const response = await apiClient.post<ApiResponse<ExamResult[]>>(`/exams/${examId}/results`, { records });
  return response.data.data;
}

export async function getStudentResultHistory(studentId: string) {
  const response = await apiClient.get<ApiResponse<ExamResult[]>>(`/students/${studentId}/results`);
  return response.data.data;
}

export async function getBatchResults(batchId: string) {
  const response = await apiClient.get<ApiResponse<ExamResult[]>>(`/batches/${batchId}/results`);
  return response.data;
}
