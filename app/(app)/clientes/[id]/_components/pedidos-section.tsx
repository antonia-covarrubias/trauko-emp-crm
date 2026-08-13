import Link from "next/link";
import { Plus } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/format";

type PedidoResumen = {
  id: string;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  ingreso_bruto: number | null;
};

type PedidosSectionProps = {
  clienteId: string;
  pedidos: PedidoResumen[];
};

export function PedidosSection({ clienteId, pedidos }: PedidosSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedidos</CardTitle>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/ventas/nuevo?cliente_id=${clienteId}`} />}
        >
          <Plus />
          Nuevo pedido para este cliente
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° pedido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha entrega</TableHead>
                <TableHead className="text-right">Ingreso bruto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Sin pedidos registrados.
                  </TableCell>
                </TableRow>
              )}
              {pedidos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link href={`/ventas/${p.id}`} className="hover:underline">
                      {p.numero_pedido ?? "(sin número)"}
                    </Link>
                  </TableCell>
                  <TableCell>{p.estado ?? "—"}</TableCell>
                  <TableCell>{formatDate(p.fecha_entrega)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(p.ingreso_bruto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
