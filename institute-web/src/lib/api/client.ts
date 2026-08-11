import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
  },
});

export async function getCsrfCookie() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
  });
}

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
};
