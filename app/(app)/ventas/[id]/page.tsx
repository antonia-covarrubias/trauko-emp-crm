import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { estadoPedidoVariant, formatCurrency, formatDate } from "@/lib/format";
import { DeletePedidoButton } from "./_components/delete-pedido-button";
import type { PedidoItem } from "@/lib/types";

type PedidoDetalle = {
  id: string;
  cliente_id: string;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  fecha_entrega_artesano: string | null;
  nro_oc: string | null;
  fecha_oc: string | null;
  nro_factura: string | null;
  fecha_factura: string | null;
  facturado: boolean | null;
  pagado: boolean | null;
  fecha_pago: string | null;
  como_llegaron: string | null;
  ingreso_neto: number | null;
  ingreso_bruto: number | null;
  notas: string | null;
  clientes: { nombre_empresa: string } | null;
  ejecutivos: { nombre: string } | null;
  artesanos: { nombre: string } | null;
};

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [pedidoRes, itemsRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, clientes(nombre_empresa), ejecutivos(nombre), artesanos(nombre)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("pedido_items").select("*").eq("pedido_id", id).order("created_at"),
  ]);

  const pedido = pedidoRes.data as PedidoDetalle | null;

  if (!pedido) {
    notFound();
  }

  const items = (itemsRes.data ?? []) as PedidoItem[];

  const campos: { label: string; value: React.ReactNode }[] = [
    { label: "Cliente", value: pedido.clientes?.nombre_empresa ?? "—" },
    { label: "Ejecutivo", value: pedido.ejecutivos?.nombre ?? "Sin asignar" },
    { label: "N° pedido", value: pedido.numero_pedido ?? "—" },
    {
      label: "Estado",
      value: pedido.estado ? (
        <Badge variant={estadoPedidoVariant(pedido.estado)}>{pedido.estado}</Badge>
      ) : (
        "—"
      ),
    },
    { label: "Fecha entrega a cliente", value: formatDate(pedido.fecha_entrega) },
    { label: "Artesano", value: pedido.artesanos?.nombre ?? "Sin asignar" },
    {
      label: "Fecha entrega del artesano",
      value: formatDate(pedido.fecha_entrega_artesano),
    },
    { label: "Cómo llegaron", value: pedido.como_llegaron ?? "—" },
    { label: "N° OC", value: pedido.nro_oc ?? "—" },
    { label: "Fecha OC", value: formatDate(pedido.fecha_oc) },
    { label: "N° factura", value: pedido.nro_factura ?? "—" },
    { label: "Fecha factura", value: formatDate(pedido.fecha_factura) },
    { label: "Fecha pago", value: formatDate(pedido.fecha_pago) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Pedido {pedido.numero_pedido ?? "(sin número)"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pedido.clientes?.nombre_empresa ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/ventas/${pedido.id}/editar`} />}
          >
            <Pencil />
            Editar
          </Button>
          <DeletePedidoButton pedidoId={pedido.id} clienteId={pedido.cliente_id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {campos.map((c) => (
            <div key={c.label}>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-sm font-medium">{c.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-muted-foreground">Facturado</p>
            <Badge variant={pedido.facturado ? "success" : "warning"}>
              {pedido.facturado ? "Sí" : "No"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pagado</p>
            <Badge variant={pedido.pagado ? "success" : "warning"}>
              {pedido.pagado ? "Sí" : "No"}
            </Badge>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-muted-foreground">Notas</p>
              <p className="text-sm">{pedido.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Líneas de producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio neto unit.</TableHead>
                  <TableHead className="text-right">Total neto</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead>Grabado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Sin líneas registradas.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.producto}</TableCell>
                    <TableCell>{item.categoria ?? "—"}</TableCell>
                    <TableCell>{item.modelo ?? "—"}</TableCell>
                    <TableCell className="text-right">{item.cantidad ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.precio_neto_unitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.total_producto_neto)}
                    </TableCell>
                    <TableCell>{item.tipo_packaging ?? "—"}</TableCell>
                    <TableCell>{item.grabado ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col items-end gap-1 text-sm">
            <p>
              Ingreso neto:{" "}
              <span className="font-medium">{formatCurrency(pedido.ingreso_neto)}</span>
            </p>
            <p>
              Ingreso bruto:{" "}
              <span className="font-medium">{formatCurrency(pedido.ingreso_bruto)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
