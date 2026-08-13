"use client";

import { BarChart3, BookOpen, Home, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Students", icon: Users, href: "/students", permissions: ["*", "students", "students.own"] },
  { label: "Courses", icon: BookOpen, href: "/courses", permissions: ["*", "courses", "courses.view"] },
  { label: "Fees", icon: Receipt, href: "/fees", permissions: ["*", "fees", "payments"] },
  { label: "Reports", icon: BarChart3, href: "/reports", permissions: ["*", "reports.allowed"] },
  { label: "Settings", icon: Settings, href: "/settings/institute-profile", permissions: ["*"] },
];

export function MobileNavigation() {
  const auth = useAuth();
  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const currentPath = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  const permissions = auth.data?.permissions ?? [];
  const visibleItems = items
    .filter((item) => !item.permissions || item.permissions.some((permission) => permissions.includes(permission)))
    .slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
      {visibleItems.map((item) => {
        const isActive = item.href === "/" ? currentPath === "/" : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 transition-colors",
              isActive && "text-slate-950",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
