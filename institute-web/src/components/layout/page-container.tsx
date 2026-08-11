import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-7xl px-4 py-6 pb-24 lg:px-8 lg:py-8", className)}>{children}</main>;
}
