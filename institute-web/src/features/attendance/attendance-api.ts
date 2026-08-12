import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { Batch } from "@/features/batches/batches-api";
import type { Student } from "@/features/students/students-api";

export type AttendanceStatus = "present" | "absent" | "leave";
export type Attendance = { id: number; batch_id: number; student_id: number; attendance_date: string; status: AttendanceStatus; remarks: string | null; student?: Student; batch?: Batch };
export type AttendanceRow = { student: Student; attendance: { status: AttendanceStatus; remarks: string | null } | null };
export async function loadAttendanceStudents(batch_id: string, attendance_date: string) {
  const r = await apiClient.get<ApiResponse<AttendanceRow[]>>("/attendance/students", { params: { batch_id, attendance_date } });
  return r.data.data;
}
export async function saveAttendance(payload: { batch_id: number; attendance_date: string; records: { student_id: number; status: AttendanceStatus; remarks?: string | null }[] }) {
  const r = await apiClient.post<ApiResponse<null>>("/attendance", payload);
  return r.data;
}
export async function getAttendanceReport(batch_id: string, month: string) {
  const r = await apiClient.get<ApiResponse<{ student: Student; present: number; absent: number; leave: number; percentage: number }[]>>("/attendance/report", { params: { batch_id, month } });
  return r.data.data;
}
