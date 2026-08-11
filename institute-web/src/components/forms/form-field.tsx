import { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-slate-800">{label}</label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function FieldHint({ children, className, ...props }: LabelHTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-500", className)} {...props}>
      {children}
    </p>
  );
}
