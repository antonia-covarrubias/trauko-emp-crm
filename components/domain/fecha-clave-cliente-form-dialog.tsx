"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
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
import {
  ORIGEN_OPTIONS,
  fechaClaveClienteSchema,
  type FechaClaveClienteFormValues,
} from "@/lib/validations";
import {
  createFechaClaveCliente,
  updateFechaClaveCliente,
} from "@/lib/actions/fechas-clave-cliente";
import type { FechaClaveCliente } from "@/lib/types";

type FechaClaveClienteFormDialogProps = {
  clienteId?: string;
  clientes?: { id: string; nombre_empresa: string }[];
  fecha?: FechaClaveCliente;
  trigger: React.ReactElement<{ children?: React.ReactNode }>;
};

function toValues(
  clienteId: string | undefined,
  fecha?: FechaClaveCliente,
): FechaClaveClienteFormValues {
  return {
    cliente_id: fecha?.cliente_id ?? clienteId ?? "",
    nombre_fecha: fecha?.nombre_fecha ?? "",
    mes: fecha?.mes ?? null,
    dia: fecha?.dia ?? null,
    fecha_general_id: fecha?.fecha_general_id ?? null,
    origen: fecha?.origen ?? "confirmado_cliente",
    notas: fecha?.notas ?? "",
    activo: fecha?.activo ?? true,
  };
}

export function FechaClaveClienteFormDialog({
  clienteId,
  clientes,
  fecha,
  trigger,
}: FechaClaveClienteFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(fecha);

  const form = useForm<FechaClaveClienteFormValues>({
    resolver: zodResolver(fechaClaveClienteSchema),
    defaultValues: toValues(clienteId, fecha),
  });

  async function onSubmit(values: FechaClaveClienteFormValues) {
    const result = isEditing
      ? await updateFechaClaveCliente(fecha!.id, values)
      : await createFechaClaveCliente(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Fecha clave actualizada." : "Fecha clave agregada.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(toValues(clienteId, fecha));
      }}
    >
      <DialogTrigger render={trigger}>{trigger.props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar fecha clave" : "Nueva fecha clave"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos de esta fecha clave."
              : "Registra una fecha clave para hacer seguimiento comercial."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {!clienteId && clientes && (
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Combobox
                        options={clientes.map((c) => ({
                          value: c.id,
                          label: c.nombre_empresa,
                        }))}
                        value={field.value || null}
                        onChange={(v) => field.onChange(v ?? "")}
                        placeholder="Selecciona un cliente…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="nombre_fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la fecha</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes (1-12)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día (1-31)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="origen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origen</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ORIGEN_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Activa</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
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
