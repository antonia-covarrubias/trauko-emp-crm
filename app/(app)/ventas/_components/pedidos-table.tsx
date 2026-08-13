"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/domain/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export type PedidoListRow = {
  id: string;
  cliente_nombre: string;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  ingreso_bruto: number | null;
  facturado: boolean | null;
  pagado: boolean | null;
};

type PedidosTableProps = {
  rows: PedidoListRow[];
};

export function PedidosTable({ rows }: PedidosTableProps) {
  const router = useRouter();
  const [clienteFiltro, setClienteFiltro] = React.useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = React.useState<string | null>(null);

  const clienteOptions = React.useMemo(() => {
    const nombres = Array.from(new Set(rows.map((r) => r.cliente_nombre)));
    return nombres.map((n) => ({ value: n, label: n }));
  }, [rows]);

  const estadoOptions = React.useMemo(() => {
    const estados = Array.from(
      new Set(rows.map((r) => r.estado).filter((e): e is string => Boolean(e))),
    );
    return estados.map((e) => ({ value: e, label: e }));
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (clienteFiltro && r.cliente_nombre !== clienteFiltro) return false;
    if (estadoFiltro && r.estado !== estadoFiltro) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Combobox
            options={clienteOptions}
            value={clienteFiltro}
            onChange={setClienteFiltro}
            placeholder="Filtrar por cliente…"
            className="sm:w-56"
          />
          <Combobox
            options={estadoOptions}
            value={estadoFiltro}
            onChange={setEstadoFiltro}
            placeholder="Filtrar por estado…"
            className="sm:w-48"
          />
        </div>
        <Button render={<Link href="/ventas/nuevo" />}>
          <Plus />
          Nuevo pedido
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>N° pedido</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha entrega</TableHead>
              <TableHead className="text-right">Ingreso bruto</TableHead>
              <TableHead>Facturado</TableHead>
              <TableHead>Pagado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin pedidos.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/ventas/${row.id}`)}
              >
                <TableCell className="font-medium">{row.cliente_nombre}</TableCell>
                <TableCell>{row.numero_pedido ?? "—"}</TableCell>
                <TableCell>{row.estado ?? "—"}</TableCell>
                <TableCell>{formatDate(row.fecha_entrega)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.ingreso_bruto)}
                </TableCell>
                <TableCell>
                  <Badge variant={row.facturado ? "outline" : "secondary"}>
                    {row.facturado ? "Sí" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.pagado ? "outline" : "secondary"}>
                    {row.pagado ? "Sí" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
