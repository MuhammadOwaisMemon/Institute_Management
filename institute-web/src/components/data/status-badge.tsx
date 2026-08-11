import { cn } from "@/lib/utils";

const variants = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ status, label }: { status: keyof typeof variants; label: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1", variants[status])}>{label}</span>;
}
