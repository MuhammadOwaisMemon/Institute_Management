"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { getCurrentUser, type AuthUser } from "./auth-api";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function normalizePathname(pathname: string) {
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || "/";
  }

  return pathname;
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
}

export function setAuthUser(queryClient: ReturnType<typeof useQueryClient>, user: AuthUser | null) {
  queryClient.setQueryData(["auth-user"], user);
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const normalizedPathname = normalizePathname(pathname);
  const isPublicRoute = publicRoutes.some((route) => normalizedPathname.startsWith(route));

  useEffect(() => {
    if (!isPublicRoute && auth.isError) {
      router.replace(`/login?next=${encodeURIComponent(normalizedPathname)}`);
    }

    if (isPublicRoute && auth.data) {
      router.replace("/");
    }
  }, [auth.data, auth.isError, isPublicRoute, normalizedPathname, router]);

  if (auth.isLoading && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isPublicRoute && auth.isError) {
    return null;
  }

  return <>{children}</>;
}
