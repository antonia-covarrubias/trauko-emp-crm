"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { GrupoFormDialog } from "./grupo-form-dialog";

export type GrupoListRow = {
  id: string;
  nombre: string;
  total_subempresas: number;
  ingreso_bruto_total: number | null;
};

type GruposTableProps = {
  rows: GrupoListRow[];
};

export function GruposTable({ rows }: GruposTableProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <GrupoFormDialog />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-right">Subempresas</TableHead>
              <TableHead className="text-right">Ingreso bruto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Sin grupos registrados.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/grupos/${row.id}`)}
              >
                <TableCell className="font-medium">{row.nombre}</TableCell>
                <TableCell className="text-right">{row.total_subempresas}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.ingreso_bruto_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
