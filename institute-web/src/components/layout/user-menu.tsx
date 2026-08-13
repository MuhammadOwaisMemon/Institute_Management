"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, UserCog, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/auth-api";
import { useAuth } from "@/features/auth/auth-provider";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      setOpen(false);
      router.replace("/login");
    },
  });

  return (
    <div className="relative">
      <Button variant="outline" size="icon" aria-label="User menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <UserRound className="h-5 w-5" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-950">{auth.data?.name ?? "User"}</p>
            <p className="mt-1 truncate text-xs capitalize text-slate-500">{auth.data?.role ?? "Account"}</p>
          </div>

          <div className="p-2">
            {auth.data?.role === "admin" ? (
              <>
                <MenuLink href="/settings/institute-profile" icon={Settings} label="Institute profile" onClick={() => setOpen(false)} />
                <MenuLink href="/settings/users" icon={UserCog} label="Users" onClick={() => setOpen(false)} />
              </>
            ) : null}
            <button
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({ href, icon: Icon, label, onClick }: { href: string; icon: typeof Settings; label: string; onClick: () => void }) {
  return (
    <Link href={href} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950" onClick={onClick}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
