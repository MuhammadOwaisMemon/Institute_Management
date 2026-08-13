import axios, { type InternalAxiosRequestConfig } from "axios";

const authTokenKey = "institute-auth-token";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(authTokenKey);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(authTokenKey, token);
    return;
  }

  window.localStorage.removeItem(authTokenKey);
}

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

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (InternalAxiosRequestConfig & { _csrfRetry?: boolean }) | undefined;
    const method = originalRequest?.method?.toLowerCase();
    const isMutation = method ? ["post", "put", "patch", "delete"].includes(method) : false;

    if (error?.response?.status === 419 && originalRequest && isMutation && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      await getCsrfCookie();
      delete originalRequest.headers["X-XSRF-TOKEN"];
      delete originalRequest.headers["x-xsrf-token"];
      return apiClient(originalRequest);
    }

    if (error?.response?.status === 401) {
      setAuthToken(null);

      if (typeof window !== "undefined") {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const loginPath = `${basePath}/login`;

        if (!window.location.pathname.endsWith("/login")) {
          // Axios interceptors run outside React components, so use a hard redirect for expired auth.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `${loginPath}?next=${encodeURIComponent(window.location.pathname.replace(basePath, "") || "/")}`;
        }
      }
    }

    return Promise.reject(error);
  },
);

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
  meta?: {
    token?: string;
    [key: string]: unknown;
  };
};
