import { apiClient, getCsrfCookie, setAuthToken, type ApiResponse } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  institute_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: "active" | "inactive";
  permissions: string[];
};

export async function login(payload: { email: string; password: string }) {
  await getCsrfCookie();
  const response = await apiClient.post<ApiResponse<AuthUser>>("/auth/login", payload);
  setAuthToken(response.data.meta?.token ?? null);

  return response.data.data;
}

export async function logout() {
  try {
    await apiClient.post<ApiResponse<null>>("/auth/logout");
  } finally {
    setAuthToken(null);
  }
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/user");
  return response.data.data;
}

export async function forgotPassword(payload: { email: string }) {
  await getCsrfCookie();
  const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }) {
  await getCsrfCookie();
  const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", payload);
  return response.data;
}

export async function changePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
  const response = await apiClient.put<ApiResponse<null>>("/auth/change-password", payload);
  return response.data;
}
