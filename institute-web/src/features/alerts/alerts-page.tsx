"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAlerts, markAlertRead, type InternalAlert } from "./alerts-api";
import { toast } from "sonner";

export function AlertsPage() {
  const queryClient = useQueryClient();
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: getAlerts, staleTime: 60_000 });
  const read = useMutation({
    mutationFn: markAlertRead,
    onMutate: async (key) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof getAlerts>>>(["alerts"]);

      if (previous) {
        queryClient.setQueryData<Awaited<ReturnType<typeof getAlerts>>>(["alerts"], {
          ...previous,
          unread_count: Math.max(0, previous.unread_count - (previous.alerts.find((alert) => alert.key === key && !alert.is_read) ? 1 : 0)),
          alerts: previous.alerts.map((alert) => (alert.key === key ? { ...alert, is_read: true, read_at: new Date().toISOString() } : alert)),
        });
      }

      return { previous };
    },
    onError: (_error, _key, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["alerts"], context.previous);
      }

      toast.error("Alert could not be marked as read.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <>
      <PageHeader title="Alerts" description="Fee, installment, and batch reminders for daily follow-up." />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {alerts.isLoading ? <LoadingSkeleton className="h-64" /> : null}
        {alerts.data && alerts.data.alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.data.alerts.map((alert) => <AlertRow key={alert.key} alert={alert} isReading={read.isPending && read.variables === alert.key} onRead={() => read.mutate(alert.key)} />)}
          </div>
        ) : null}
        {alerts.data && alerts.data.alerts.length === 0 ? <EmptyState icon={Bell} title="No alerts right now" description="New reminders will appear when fees are due or batches need attention." /> : null}
      </section>
    </>
  );
}

function AlertRow({ alert, isReading, onRead }: { alert: InternalAlert; isReading: boolean; onRead: () => void }) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between", alert.is_read ? "bg-white" : "bg-slate-50")}>
      <Link href={alert.href} className="min-w-0 flex-1" onClick={onRead}>
        <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
        <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
        {alert.date ? <p className="mt-2 text-xs font-medium text-slate-600">{alert.date}</p> : null}
      </Link>
      {!alert.is_read ? <Button variant="outline" size="sm" disabled={isReading} onClick={onRead}>{isReading ? "Marking..." : "Mark as read"}</Button> : <span className="text-xs font-medium text-slate-400">Read</span>}
    </div>
  );
}
