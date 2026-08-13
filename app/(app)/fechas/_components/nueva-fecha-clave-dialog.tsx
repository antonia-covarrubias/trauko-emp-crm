"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ClienteMultiSelect } from "@/components/domain/cliente-multi-select";
import {
  fechaClaveClienteBulkSchema,
  type FechaClaveClienteBulkValues,
} from "@/lib/validations";
import { createFechasClaveClienteBulk } from "@/lib/actions/fechas-clave-cliente";

const DEFAULT_VALUES: FechaClaveClienteBulkValues = {
  nombre_fecha: "",
  mes: null,
  dia: null,
  fecha_general_id: null,
  clienteIds: [],
};

type NuevaFechaClaveDialogProps = {
  clientesActivos: { id: string; nombre_empresa: string }[];
};

export function NuevaFechaClaveDialog({ clientesActivos }: NuevaFechaClaveDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const form = useForm<FechaClaveClienteBulkValues>({
    resolver: zodResolver(fechaClaveClienteBulkSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: FechaClaveClienteBulkValues) {
    const result = await createFechasClaveClienteBulk(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Fecha "${values.nombre_fecha}" creada.`);
    setOpen(false);
    form.reset(DEFAULT_VALUES);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset(DEFAULT_VALUES);
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus />
        Nueva fecha
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva fecha clave</DialogTitle>
          <DialogDescription>
            Crea una fecha y asocia de una vez a los clientes que correspondan. El
            origen queda como &ldquo;Confirmado por cliente&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              name="clienteIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clientes</FormLabel>
                  <FormControl>
                    <ClienteMultiSelect
                      options={clientesActivos.map((c) => ({
                        value: c.id,
                        label: c.nombre_empresa,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando…" : "Crear fecha"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
