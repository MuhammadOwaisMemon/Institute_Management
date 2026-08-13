"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  Banknote,
  CalendarClock,
  CalendarDays,
  CreditCard,
  GraduationCap,
  Plus,
  Receipt,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-provider";
import type { Enrollment } from "@/features/admissions/admissions-api";
import type { Batch } from "@/features/batches/batches-api";
import type { FeeInstallment } from "@/features/fees/fees-api";
import type { Payment } from "@/features/payments/payments-api";
import { getDashboard, type DashboardKpis, type MonthlyFeeCollection } from "./dashboard-api";

const kpiCards = [
  { key: "total_students", label: "Total Students", icon: Users, href: "/students", tone: "bg-cyan-50 text-cyan-700 ring-cyan-100", money: false },
  { key: "active_students", label: "Active Students", icon: UserCheck, href: "/students", tone: "bg-emerald-50 text-emerald-700 ring-emerald-100", money: false },
  { key: "active_batches", label: "Active Batches", icon: CalendarDays, href: "/batches", tone: "bg-indigo-50 text-indigo-700 ring-indigo-100", money: false },
  { key: "todays_classes", label: "Today's Classes", icon: CalendarClock, href: "/schedule", tone: "bg-amber-50 text-amber-700 ring-amber-100", money: false },
  { key: "this_month_collection", label: "This Month Collection", icon: Banknote, href: "/payments", tone: "bg-teal-50 text-teal-700 ring-teal-100", money: true },
  { key: "pending_fees", label: "Pending Fees", icon: Receipt, href: "/fees", tone: "bg-rose-50 text-rose-700 ring-rose-100", money: true },
] as const;

const quickActions = [
  { label: "New Admission", href: "/admissions", icon: GraduationCap },
  { label: "Receive Fee", href: "/payments", icon: CreditCard },
  { label: "Take Attendance", href: "/attendance", icon: CalendarDays },
  { label: "Add Student", href: "/students", icon: UserPlus },
];

export function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    enabled: Boolean(auth.data),
    retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (dashboard.isError && isUnauthorizedError(dashboard.error)) {
      router.replace("/login");
    }
  }, [dashboard.error, dashboard.isError, router]);

  if (auth.isLoading || !auth.data || dashboard.isLoading) {
    return (
      <>
        <DashboardHeader />
        <DashboardSkeleton />
      </>
    );
  }

  if (dashboard.isError) {
    return (
      <>
        <DashboardHeader />
        <ErrorState title="Dashboard could not load" description={dashboardErrorDescription(dashboard.error)} onRetry={() => dashboard.refetch()} />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      {dashboard.isLoading ? <DashboardSkeleton /> : null}
      {dashboard.data ? (
        <div className="space-y-6">
          <KpiGrid kpis={dashboard.data.kpis} />
          <QuickActions />
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <TodayClasses items={dashboard.data.today_classes} />
            <MonthlyChart items={dashboard.data.monthly_fee_collection} />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <RecentAdmissions items={dashboard.data.recent_admissions} />
            <RecentPayments items={dashboard.data.recent_payments} />
            <PendingFees items={dashboard.data.pending_fees} />
          </div>
        </div>
      ) : null}
    </>
  );
}

function isUnauthorizedError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 401;
}

function dashboardErrorDescription(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) {
      return "Your user role does not have permission to view the dashboard.";
    }

    if (error.response?.status) {
      return "The API responded with an error. Please retry after a moment.";
    }
  }

  return "Please check the API connection and try again.";
}

function DashboardHeader() {
  return (
    <PageHeader
      title="Dashboard"
      description="Live operational snapshot for admissions, classes, fees, and collections."
      actions={
        <Button asChild>
          <Link href="/admissions">
            <Plus className="h-4 w-4" />
            New Admission
          </Link>
        </Button>
      }
    />
  );
}

function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpiCards.map((item) => {
        const value = kpis[item.key];
        return (
          <Link key={item.key} href={item.href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{item.money ? money(String(value)) : value}</p>
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl ring-1", item.tone)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

function QuickActions() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {quickActions.map((action) => (
        <Button key={action.href} asChild variant="outline" className="h-12 justify-start border-slate-200 bg-white shadow-sm">
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      ))}
    </section>
  );
}

function TodayClasses({ items }: { items: Batch[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle title="Today's Classes" href="/schedule" />
      {items.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((batch) => (
            <Link key={batch.id} href={`/batches/${batch.id}`} className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-sm font-semibold text-slate-950">{batch.course?.name ?? "Course"}</p>
              <p className="mt-1 text-sm text-slate-500">{batch.name}</p>
              <div className="mt-4 grid gap-2 text-xs text-slate-600">
                <p>{formatTime(batch.start_time)} - {formatTime(batch.end_time)}</p>
                <p>{batch.teacher?.full_name ?? "Unassigned"} | {batch.room ?? "No room"}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState icon={CalendarClock} title="No classes today" description="Active batches scheduled for today will appear here." />
        </div>
      )}
    </section>
  );
}

function RecentAdmissions({ items }: { items: Enrollment[] }) {
  return (
    <ListSection title="Recent Admissions" href="/admissions" emptyIcon={GraduationCap} emptyTitle="No recent admissions" emptyDescription="Latest enrollments will appear here.">
      {items.map((item) => (
        <Link key={item.id} href={`/students/${item.student.id}`} className="block rounded-lg border border-slate-100 p-3 transition hover:border-slate-300 hover:bg-slate-50">
          <p className="text-sm font-semibold text-slate-950">{item.student.full_name}</p>
          <p className="mt-1 text-xs text-slate-500">{item.course.name} | {item.batch.name}</p>
          <p className="mt-2 text-xs font-medium text-slate-700">{formatDate(item.enrollment_date)}</p>
        </Link>
      ))}
    </ListSection>
  );
}

function RecentPayments({ items }: { items: Payment[] }) {
  return (
    <ListSection title="Recent Payments" href="/payments" emptyIcon={Receipt} emptyTitle="No recent payments" emptyDescription="Received fees and receipts will appear here.">
      {items.map((item) => (
        <Link key={item.id} href={`/payments/receipts/${item.id}`} className="block rounded-lg border border-slate-100 p-3 transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.student.full_name}</p>
              <p className="mt-1 text-xs text-slate-500">{item.receipt_number} | {formatDate(item.payment_date)}</p>
            </div>
            <p className="text-sm font-semibold text-emerald-700">{money(item.amount)}</p>
          </div>
        </Link>
      ))}
    </ListSection>
  );
}

function PendingFees({ items }: { items: FeeInstallment[] }) {
  return (
    <ListSection title="Pending Fees" href="/fees" emptyIcon={Receipt} emptyTitle="No pending fees" emptyDescription="Pending and overdue installments will appear here.">
      {items.map((item) => (
        <Link key={item.id} href="/fees" className="block rounded-lg border border-slate-100 p-3 transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.enrollment?.student.full_name ?? "Student"}</p>
              <p className="mt-1 text-xs text-slate-500">{item.title} | due {formatDate(item.due_date)}</p>
            </div>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-800">{money(String(Number(item.amount) - Number(item.paid_amount)))}</p>
        </Link>
      ))}
    </ListSection>
  );
}

function MonthlyChart({ items }: { items: MonthlyFeeCollection[] }) {
  const max = Math.max(...items.map((item) => Number(item.amount)), 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle title="Monthly Fee Collection" href="/payments" />
      <div className="mt-5 flex h-72 items-end gap-3">
        {items.map((item) => {
          const height = Math.max((Number(item.amount) / max) * 100, Number(item.amount) > 0 ? 8 : 2);
          return (
            <Link key={item.month} href="/payments" className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-slate-600 opacity-0 transition group-hover:opacity-100">{money(item.amount)}</span>
              <span className="w-full rounded-t-lg bg-gradient-to-t from-slate-950 to-cyan-500 transition group-hover:from-slate-800" style={{ height: `${height}%` }} />
              <span className="w-full truncate text-center text-xs text-slate-500">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ListSection({ title, href, emptyIcon, emptyTitle, emptyDescription, children }: { title: string; href: string; emptyIcon: LucideIcon; emptyTitle: string; emptyDescription: string; children: ReactNode[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle title={title} href={href} />
      {children.length ? <div className="mt-4 space-y-3">{children}</div> : <div className="mt-4"><EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} /></div>}
    </section>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <Link href={href} className="text-sm font-medium text-slate-600 hover:text-slate-950">View all</Link>
    </div>
  );
}

function StatusPill({ status }: { status: FeeInstallment["status"] }) {
  const styles = status === "overdue" ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-amber-50 text-amber-700 ring-amber-100";
  return <span className={cn("shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize ring-1", styles)}>{status.replace("_", " ")}</span>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />)}
      </section>
      <LoadingSkeleton className="h-12" />
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <LoadingSkeleton className="h-80" />
        <LoadingSkeleton className="h-80" />
      </div>
    </div>
  );
}

function money(value: string) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-PK", { hour: "2-digit", minute: "2-digit" }).format(new Date(2026, 0, 1, hours, minutes));
}
