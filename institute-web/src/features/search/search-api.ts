import { apiClient, type ApiResponse } from "@/lib/api/client";

export type SearchResult = {
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

export type GlobalSearchResponse = {
  students: SearchResult[];
  courses: SearchResult[];
  batches: SearchResult[];
};

export async function globalSearch(query: string) {
  const response = await apiClient.get<ApiResponse<GlobalSearchResponse>>("/search", { params: { q: query } });
  return response.data.data;
}
