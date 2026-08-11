import { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Icon className="mb-3 h-8 w-8 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
