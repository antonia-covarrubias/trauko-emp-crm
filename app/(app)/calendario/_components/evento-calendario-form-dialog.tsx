"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/domain/combobox";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { eventoCalendarioSchema, type EventoCalendarioFormValues } from "@/lib/validations";
import {
  createEventoCalendario,
  updateEventoCalendario,
  deleteEventoCalendario,
} from "@/lib/actions/eventos-calendario";
import { dateKey } from "./grid-utils";
import type { TipoEvento } from "@/lib/types";
import type { EventoCalendarioRow } from "@/lib/calendar/build-events";

type PedidoOption = { id: string; numero_pedido: string | null; cliente_nombre: string };

type EventoCalendarioFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tiposEvento: TipoEvento[];
  clientes: { id: string; nombre_empresa: string }[];
  pedidos: PedidoOption[];
  evento?: EventoCalendarioRow;
  presetFecha?: Date;
};

function toValues(
  evento: EventoCalendarioRow | undefined,
  presetFecha: Date | undefined,
  tiposEvento: TipoEvento[],
): EventoCalendarioFormValues {
  return {
    tipo_evento_id: evento?.tipo_evento_id ?? tiposEvento[0]?.id ?? "",
    titulo: evento?.titulo ?? "",
    descripcion: evento?.descripcion ?? "",
    fecha: evento?.fecha ?? (presetFecha ? dateKey(presetFecha) : ""),
    fecha_fin: evento?.fecha_fin ?? "",
    cliente_id: evento?.cliente_id ?? null,
    pedido_id: evento?.pedido_id ?? null,
    activo: true,
  };
}

export function EventoCalendarioFormDialog({
  open,
  onOpenChange,
  tiposEvento,
  clientes,
  pedidos,
  evento,
  presetFecha,
}: EventoCalendarioFormDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(evento);

  const form = useForm<EventoCalendarioFormValues>({
    resolver: zodResolver(eventoCalendarioSchema),
    defaultValues: toValues(evento, presetFecha, tiposEvento),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(toValues(evento, presetFecha, tiposEvento));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, evento, presetFecha]);

  async function onSubmit(values: EventoCalendarioFormValues) {
    const result = isEditing
      ? await updateEventoCalendario(evento!.id, values)
      : await createEventoCalendario(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Evento actualizado." : "Evento creado.");
    onOpenChange(false);
    router.refresh();
  }

  const clienteOptions = clientes.map((c) => ({ value: c.id, label: c.nombre_empresa }));
  const pedidoOptions = pedidos.map((p) => ({
    value: p.id,
    label: `${p.numero_pedido ?? "(sin número)"} — ${p.cliente_nombre}`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar evento" : "Nuevo evento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos de este evento del calendario."
              : "Crea un evento manual en el calendario (ej. una entrega especial o un recordatorio)."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo_evento_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de evento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo…">
                          {(value: string) =>
                            tiposEvento.find((t) => t.id === value)?.nombre ?? value
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposEvento.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha fin (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente (opcional)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={clienteOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sin cliente asociado…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pedido_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido (opcional)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={pedidoOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sin pedido asociado…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-between">
              {isEditing ? (
                <DeleteAlertDialog
                  trigger={
                    <Button type="button" variant="destructive">
                      <Trash2 />
                      Eliminar
                    </Button>
                  }
                  title="Eliminar evento"
                  description={`¿Eliminar "${evento!.titulo}"? Esta acción no se puede deshacer.`}
                  onConfirm={async () => {
                    const result = await deleteEventoCalendario(evento!.id);
                    if (result.success) {
                      onOpenChange(false);
                      router.refresh();
                    }
                    return result;
                  }}
                />
              ) : (
                <span />
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
