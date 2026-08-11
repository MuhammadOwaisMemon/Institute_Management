import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-950">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5" />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-red-800">{description}</p>
          {onRetry ? (
            <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
