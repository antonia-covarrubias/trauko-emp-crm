"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/domain/combobox";
import { cambiarGrupoCliente } from "@/lib/actions/clientes";

type CambiarGrupoDialogProps = {
  clienteId: string;
  grupos: { id: string; nombre: string }[];
  grupoActualId: string;
};

export function CambiarGrupoDialog({
  clienteId,
  grupos,
  grupoActualId,
}: CambiarGrupoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [grupoId, setGrupoId] = React.useState<string | null>(grupoActualId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleConfirm() {
    if (!grupoId) return;
    setIsSubmitting(true);
    const result = await cambiarGrupoCliente(clienteId, grupoId);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Grupo actualizado.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setGrupoId(grupoActualId);
      }}
    >
      <DialogTrigger render={<Button variant="link" size="sm" className="h-auto p-0" />}>
        Cambiar de grupo
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar de grupo</DialogTitle>
          <DialogDescription>
            Reasigna este cliente a otro grupo empresarial ya existente.
          </DialogDescription>
        </DialogHeader>

        <Combobox
          options={grupos.map((g) => ({ value: g.id, label: g.nombre }))}
          value={grupoId}
          onChange={setGrupoId}
          placeholder="Selecciona un grupo…"
        />

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !grupoId || grupoId === grupoActualId}
          >
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
