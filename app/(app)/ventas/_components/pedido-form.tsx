"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox, CreatableCombobox } from "@/components/domain/combobox";
import { pedidoSchema, type PedidoFormValues } from "@/lib/validations";
import { createPedido, updatePedido } from "@/lib/actions/pedidos";
import { formatCurrency } from "@/lib/format";
import type { Artesano, Ejecutivo, Pedido, PedidoItem } from "@/lib/types";

const ESTADO_OPTIONS = [
  { value: "LISTO", label: "LISTO" },
  { value: "EN PRODUCCIÓN", label: "EN PRODUCCIÓN" },
  { value: "POR CONFIRMAR", label: "POR CONFIRMAR" },
  { value: "ENTREGADO", label: "ENTREGADO" },
];

const EMPTY_ITEM: PedidoFormValues["items"][number] = {
  producto: "",
  categoria: "",
  modelo: "",
  cantidad: 0,
  costo_neto_unitario: 0,
  precio_neto_unitario: 0,
  total_producto_neto: 0,
  tipo_packaging: "",
  grabado: "",
};

function toValues(
  clienteId: string | undefined,
  pedido?: Pedido,
  items?: PedidoItem[],
): PedidoFormValues {
  return {
    cliente_id: pedido?.cliente_id ?? clienteId ?? "",
    ejecutivo_id: pedido?.ejecutivo_id ?? null,
    artesano_id: pedido?.artesano_id ?? null,
    fecha_entrega_artesano: pedido?.fecha_entrega_artesano ?? "",
    numero_pedido: pedido?.numero_pedido ?? "",
    estado: pedido?.estado ?? "",
    fecha_entrega: pedido?.fecha_entrega ?? "",
    nro_oc: pedido?.nro_oc ?? "",
    fecha_oc: pedido?.fecha_oc ?? "",
    nro_factura: pedido?.nro_factura ?? "",
    fecha_factura: pedido?.fecha_factura ?? "",
    facturado: pedido?.facturado ?? false,
    pagado: pedido?.pagado ?? false,
    fecha_pago: pedido?.fecha_pago ?? "",
    como_llegaron: pedido?.como_llegaron ?? "",
    notas: pedido?.notas ?? "",
    items: items && items.length > 0
      ? items.map((i) => ({
          producto: i.producto,
          categoria: i.categoria ?? "",
          modelo: i.modelo ?? "",
          cantidad: i.cantidad ?? 0,
          costo_neto_unitario: i.costo_neto_unitario ?? 0,
          precio_neto_unitario: i.precio_neto_unitario ?? 0,
          total_producto_neto: i.total_producto_neto ?? 0,
          tipo_packaging: i.tipo_packaging ?? "",
          grabado: i.grabado ?? "",
        }))
      : [EMPTY_ITEM],
  };
}

type PedidoFormProps = {
  clientes: { id: string; nombre_empresa: string }[];
  ejecutivos: Ejecutivo[];
  artesanos: Artesano[];
  clientePreseleccionadoId?: string;
  pedido?: Pedido;
  items?: PedidoItem[];
};

export function PedidoForm({
  clientes,
  ejecutivos,
  artesanos,
  clientePreseleccionadoId,
  pedido,
  items,
}: PedidoFormProps) {
  const router = useRouter();
  const isEditing = Boolean(pedido);

  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: toValues(clientePreseleccionadoId, pedido, items),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const totalPreview = watchedItems.reduce(
    (sum, item) => sum + (Number(item.total_producto_neto) || 0),
    0,
  );

  function recalcTotal(index: number) {
    const item = form.getValues(`items.${index}`);
    const total = (Number(item.cantidad) || 0) * (Number(item.precio_neto_unitario) || 0);
    form.setValue(`items.${index}.total_producto_neto`, total, { shouldDirty: true });
  }

  async function onSubmit(values: PedidoFormValues) {
    if (isEditing) {
      const result = await updatePedido(pedido!.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido actualizado.");
      router.push(`/ventas/${pedido!.id}`);
      return;
    }

    const result = await createPedido(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Pedido creado.");
    router.push(`/ventas/${result.data.id}`);
  }

  const clienteOptions = clientes.map((c) => ({ value: c.id, label: c.nombre_empresa }));
  const ejecutivoActivos = ejecutivos.filter(
    (e) => e.activo || e.id === pedido?.ejecutivo_id,
  );
  const artesanoActivos = artesanos.filter(
    (a) => a.activo || a.id === pedido?.artesano_id,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Combobox
                      options={clienteOptions}
                      value={field.value || null}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Selecciona un cliente…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ejecutivo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ejecutivo</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin asignar">
                          {(value: string) =>
                            value && value !== "none"
                              ? (ejecutivoActivos.find((e) => e.id === value)?.nombre ?? value)
                              : "Sin asignar"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {ejecutivoActivos.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nombre}
                          {!e.activo ? " (inactivo)" : ""}
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
              name="artesano_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artesano</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin asignar">
                          {(value: string) =>
                            value && value !== "none"
                              ? (artesanoActivos.find((a) => a.id === value)?.nombre ?? value)
                              : "Sin asignar"
                          }
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {artesanoActivos.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nombre}
                          {!a.activo ? " (inactivo)" : ""}
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
              name="numero_pedido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° pedido</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <CreatableCombobox
                      options={ESTADO_OPTIONS}
                      value={field.value || null}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Selecciona o escribe un estado…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_entrega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha entrega a cliente</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_entrega_artesano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha entrega del artesano</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Cuándo te entrega el artesano a ti (no al cliente).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="como_llegaron"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cómo llegaron</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: referido, web, licitación…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nro_oc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° OC</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_oc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha OC</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nro_factura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° factura</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_factura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha factura</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha pago</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facturado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Facturado</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pagado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Pagado</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Líneas de producto</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => append(EMPTY_ITEM)}>
              <Plus />
              Agregar línea
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-40">Producto</TableHead>
                    <TableHead className="min-w-32">Categoría</TableHead>
                    <TableHead className="min-w-32">Modelo</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-32">Costo neto unit.</TableHead>
                    <TableHead className="w-32">Precio neto unit.</TableHead>
                    <TableHead className="w-32">Total neto</TableHead>
                    <TableHead className="min-w-32">Packaging</TableHead>
                    <TableHead className="min-w-32">Grabado</TableHead>
                    <TableHead className="w-0"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input {...form.register(`items.${index}.producto`)} />
                      </TableCell>
                      <TableCell>
                        <Input {...form.register(`items.${index}.categoria`)} />
                      </TableCell>
                      <TableCell>
                        <Input {...form.register(`items.${index}.modelo`)} />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          {...form.register(`items.${index}.cantidad`, {
                            valueAsNumber: true,
                            onChange: () => recalcTotal(index),
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          {...form.register(`items.${index}.costo_neto_unitario`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          {...form.register(`items.${index}.precio_neto_unitario`, {
                            valueAsNumber: true,
                            onChange: () => recalcTotal(index),
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          {...form.register(`items.${index}.total_producto_neto`, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input {...form.register(`items.${index}.tipo_packaging`)} />
                      </TableCell>
                      <TableCell>
                        <Input {...form.register(`items.${index}.grabado`)} />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              Total de las líneas (se usa como ingreso neto e ingreso bruto del pedido):{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(totalPreview)}
              </span>
            </p>
          </CardContent>
        </Card>

        <div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Crear pedido"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
