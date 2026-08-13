"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { clienteDetalleSchema, type ClienteDetalleFormValues } from "@/lib/validations";
import { updateClienteDetalle } from "@/lib/actions/clientes";

type ClienteDetalleFormProps = {
  cliente: {
    id: string;
    nombre_empresa: string;
    rut: string | null;
    rubro: string | null;
    notas: string | null;
    activo: boolean;
  };
};

export function ClienteDetalleForm({ cliente }: ClienteDetalleFormProps) {
  const form = useForm<ClienteDetalleFormValues>({
    resolver: zodResolver(clienteDetalleSchema),
    defaultValues: {
      nombre_empresa: cliente.nombre_empresa,
      rut: cliente.rut ?? "",
      rubro: cliente.rubro ?? "",
      notas: cliente.notas ?? "",
      activo: cliente.activo,
    },
  });

  async function onSubmit(values: ClienteDetalleFormValues) {
    const result = await updateClienteDetalle(cliente.id, values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Datos del cliente actualizados.");
    form.reset(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre_empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la empresa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUT</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rubro</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Activo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
