"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionResult } from "@/lib/types";

type DeleteAlertDialogProps = {
  trigger: React.ReactElement<{ children?: React.ReactNode }>;
  title: string;
  description: string;
  onConfirm: () => Promise<ActionResult<unknown>>;
  successMessage?: string;
};

export function DeleteAlertDialog({
  trigger,
  title,
  description,
  onConfirm,
  successMessage = "Eliminado correctamente.",
}: DeleteAlertDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger}>{trigger.props.children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
