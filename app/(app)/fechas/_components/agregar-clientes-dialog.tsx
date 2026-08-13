"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
import { ClienteMultiSelect } from "@/components/domain/cliente-multi-select";
import { createFechasClaveClienteBulk } from "@/lib/actions/fechas-clave-cliente";

type AgregarClientesDialogProps = {
  nombreFecha: string;
  mes: number | null;
  dia: number | null;
  fechaGeneralId: string | null;
  clientesDisponibles: { id: string; nombre_empresa: string }[];
};

export function AgregarClientesDialog({
  nombreFecha,
  mes,
  dia,
  fechaGeneralId,
  clientesDisponibles,
}: AgregarClientesDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleConfirm() {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    const result = await createFechasClaveClienteBulk({
      nombre_fecha: nombreFecha,
      mes,
      dia,
      fecha_general_id: fechaGeneralId,
      clienteIds: selected,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      `${result.data.count} cliente${result.data.count === 1 ? "" : "s"} agregado${result.data.count === 1 ? "" : "s"} a "${nombreFecha}".`,
    );
    setOpen(false);
    setSelected([]);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected([]);
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UserPlus />
        Agregar cliente(s) a esta fecha
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar clientes a &ldquo;{nombreFecha}&rdquo;</DialogTitle>
          <DialogDescription>
            Selecciona los clientes activos que quieres asociar a esta fecha clave.
          </DialogDescription>
        </DialogHeader>

        <ClienteMultiSelect
          options={clientesDisponibles.map((c) => ({
            value: c.id,
            label: c.nombre_empresa,
          }))}
          selected={selected}
          onChange={setSelected}
          emptyText="Todos los clientes activos ya están asociados a esta fecha."
        />

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={isSubmitting || selected.length === 0}>
            {isSubmitting ? "Agregando…" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
