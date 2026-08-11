import { apiClient, type ApiResponse } from "@/lib/api/client";

export type UserRole = "admin" | "receptionist" | "teacher";
export type UserStatus = "active" | "inactive";

export type ManagedUser = {
  id: number;
  institute_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type UsersMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type UserPayload = {
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  password?: string;
  password_confirmation?: string;
};

export async function getUsers(search: string) {
  const response = await apiClient.get<ApiResponse<ManagedUser[]>>("/settings/users", {
    params: { search },
  });

  return {
    users: response.data.data,
    meta: response.data.meta as UsersMeta,
  };
}

export async function createUser(payload: UserPayload) {
  const response = await apiClient.post<ApiResponse<ManagedUser>>("/settings/users", payload);
  return response.data.data;
}

export async function updateUser(id: number, payload: UserPayload) {
  const response = await apiClient.put<ApiResponse<ManagedUser>>(`/settings/users/${id}`, payload);
  return response.data.data;
}
