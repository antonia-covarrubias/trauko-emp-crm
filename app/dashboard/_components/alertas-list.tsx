import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ClienteSinCompraReciente } from "./types";

type AlertasListProps = {
  clientes: ClienteSinCompraReciente[];
};

export function AlertasList({ clientes }: AlertasListProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Última entrega</TableHead>
            <TableHead className="text-right">Ingreso bruto histórico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Sin clientes en alerta. Todos compraron en los últimos 180 días.
              </TableCell>
            </TableRow>
          )}
          {clientes.map((c) => (
            <TableRow key={c.cliente_id}>
              <TableCell className="font-medium">
                {c.nombre_empresa ?? "—"}
              </TableCell>
              <TableCell>{c.grupo_nombre ?? "—"}</TableCell>
              <TableCell>{formatDate(c.ultima_fecha_entrega)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(c.ingreso_bruto_total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
