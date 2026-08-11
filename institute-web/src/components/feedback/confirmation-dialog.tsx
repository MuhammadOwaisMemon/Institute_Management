"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ConfirmationDialog({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold text-slate-950">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500">{description}</DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
