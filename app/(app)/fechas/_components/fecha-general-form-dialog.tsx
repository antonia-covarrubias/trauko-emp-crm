"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { fechaGeneralSchema, type FechaGeneralFormValues } from "@/lib/validations";
import { createFechaGeneral, updateFechaGeneral } from "@/lib/actions/fechas-generales";
import type { FechaGeneral } from "@/lib/types";

type FechaGeneralFormDialogProps = {
  fecha?: FechaGeneral;
  trigger: React.ReactElement<{ children?: React.ReactNode }>;
};

function toValues(fecha?: FechaGeneral): FechaGeneralFormValues {
  return {
    nombre: fecha?.nombre ?? "",
    mes: fecha?.mes ?? null,
    dia: fecha?.dia ?? null,
    descripcion_regla: fecha?.descripcion_regla ?? "",
    categoria: fecha?.categoria ?? "",
    notas: fecha?.notas ?? "",
  };
}

export function FechaGeneralFormDialog({ fecha, trigger }: FechaGeneralFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isEditing = Boolean(fecha);

  const form = useForm<FechaGeneralFormValues>({
    resolver: zodResolver(fechaGeneralSchema),
    defaultValues: toValues(fecha),
  });

  async function onSubmit(values: FechaGeneralFormValues) {
    const result = isEditing
      ? await updateFechaGeneral(fecha!.id, values)
      : await createFechaGeneral(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Fecha actualizada." : "Fecha creada.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(toValues(fecha));
      }}
    >
      <DialogTrigger render={trigger}>{trigger.props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar fecha" : "Nueva fecha del calendario"}</DialogTitle>
          <DialogDescription>
            Fechas de referencia (nacionales, comerciales o sectoriales) que se pueden
            usar para sugerir fechas clave a clientes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
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
                    <FormLabel>Día (vacío si es variable)</FormLabel>
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
              name="descripcion_regla"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regla (si el día es variable)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ej: "3er domingo de junio"' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="nacional | comercial | sectorial" />
                  </FormControl>
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
