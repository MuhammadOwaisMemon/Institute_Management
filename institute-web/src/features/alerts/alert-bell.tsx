"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAlerts, markAlertRead, type InternalAlert } from "./alerts-api";

export function AlertBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: getAlerts, refetchOnWindowFocus: true, staleTime: 60_000 });
  const read = useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const unread = alerts.data?.unread_count ?? 0;
  const items = alerts.data?.alerts.slice(0, 6) ?? [];

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Alerts">
        <Bell className="h-5 w-5" />
        {unread > 0 ? <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span> : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-950">Alerts</p>
            <Link href="/alerts" className="text-xs font-medium text-slate-500 hover:text-slate-950" onClick={() => setOpen(false)}>View all</Link>
          </div>
          {alerts.isLoading ? <div className="p-4 text-sm text-slate-500">Loading alerts...</div> : null}
          {!alerts.isLoading && !items.length ? <div className="p-4 text-sm text-slate-500">No alerts right now.</div> : null}
          {items.length ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {items.map((alert) => <AlertItem key={alert.key} alert={alert} onRead={() => read.mutate(alert.key)} onClose={() => setOpen(false)} />)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AlertItem({ alert, onRead, onClose }: { alert: InternalAlert; onRead: () => void; onClose: () => void }) {
  return (
    <div className={cn("rounded-lg p-3", alert.is_read ? "bg-white" : "bg-slate-50")}>
      <Link href={alert.href} onClick={() => { onRead(); onClose(); }} className="block">
        <div className="flex items-start gap-2">
          <span className={cn("mt-1 h-2 w-2 rounded-full", alert.is_read ? "bg-slate-200" : "bg-rose-500")} />
          <div>
            <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
            <p className="mt-1 text-xs text-slate-500">{alert.message}</p>
            {alert.date ? <p className="mt-2 text-xs font-medium text-slate-600">{alert.date}</p> : null}
          </div>
        </div>
      </Link>
      {!alert.is_read ? <button className="ml-4 mt-2 text-xs font-medium text-slate-500 hover:text-slate-950" onClick={onRead}>Mark as read</button> : null}
    </div>
  );
}
