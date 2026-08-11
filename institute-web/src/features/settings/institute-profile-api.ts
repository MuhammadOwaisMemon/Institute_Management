import { apiClient, type ApiResponse } from "@/lib/api/client";

export type InstituteProfile = {
  id: number;
  name: string;
  short_name: string | null;
  logo: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  currency: string;
  timezone: string;
  receipt_footer: string | null;
  status: "active" | "inactive";
};

export type InstituteProfilePayload = Omit<InstituteProfile, "id" | "logo" | "logo_url">;

export async function getInstituteProfile() {
  const response = await apiClient.get<ApiResponse<InstituteProfile>>("/settings/institute-profile");
  return response.data.data;
}

export async function updateInstituteProfile(payload: InstituteProfilePayload) {
  const response = await apiClient.put<ApiResponse<InstituteProfile>>("/settings/institute-profile", payload);
  return response.data.data;
}

export async function uploadInstituteLogo(file: File) {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await apiClient.post<ApiResponse<InstituteProfile>>("/settings/institute-profile/logo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}
