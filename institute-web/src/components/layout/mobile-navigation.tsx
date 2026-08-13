"use client";

import { BarChart3, BookOpen, Home, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-provider";

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
  const permissions = auth.data?.permissions ?? [];
  const visibleItems = items
    .filter((item) => !item.permissions || item.permissions.some((permission) => permissions.includes(permission)))
    .slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
      {visibleItems.map((item) => (
        <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 first:text-slate-950">
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
