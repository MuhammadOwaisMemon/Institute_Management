"use client";

import { BookOpen, CalendarClock, CalendarDays, GraduationCap, LayoutDashboard, Receipt, Settings, UserCog, UserPlus, UserRoundCheck, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-provider";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Students", icon: Users, href: "/students", permissions: ["*", "students", "students.own"] },
  { label: "Admissions", icon: UserPlus, href: "/admissions", permissions: ["*", "admissions"] },
  { label: "Teachers", icon: UserRoundCheck, href: "/teachers", permissions: ["*", "teachers", "teachers.own"] },
  { label: "Courses", icon: BookOpen, href: "/courses", permissions: ["*", "courses", "courses.view"] },
  { label: "Batches", icon: CalendarDays, href: "/batches", permissions: ["*", "batches", "batches.view", "batches.own"] },
  { label: "Schedule", icon: CalendarClock, href: "/schedule", permissions: ["*", "schedule"] },
  { label: "Attendance", icon: CalendarDays, href: "/attendance", permissions: ["*", "attendance"] },
  { label: "Fees", icon: Receipt, href: "/fees", permissions: ["*", "fees", "payments"] },
  { label: "Payments", icon: Receipt, href: "/payments", permissions: ["*", "payments"] },
  { label: "Settings", icon: Settings, href: "/settings/institute-profile", permissions: ["*"] },
  { label: "Users", icon: UserCog, href: "/settings/users", permissions: ["*"] },
];

export function Sidebar({ className }: { className?: string }) {
  const auth = useAuth();
  const visibleItems = navItems.filter((item) => {
    if (!item.permissions) {
      return true;
    }

    const permissions = auth.data?.permissions ?? [];
    return item.permissions.some((permission) => permissions.includes(permission));
  });

  return (
    <aside className={cn("hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block", className)}>
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Institute Suite</p>
          <p className="text-xs text-slate-500">Training operations</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
              item.label === "Dashboard" && "bg-slate-950 text-white shadow-sm hover:bg-slate-900 hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
