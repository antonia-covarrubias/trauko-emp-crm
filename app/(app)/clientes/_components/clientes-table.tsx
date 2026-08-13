"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { ClienteFormDialog } from "./cliente-form-dialog";

export type ClienteListRow = {
  id: string;
  nombre_empresa: string;
  rubro: string | null;
  activo: boolean;
  grupo_nombre: string | null;
  contacto_principal: string | null;
  ingreso_bruto_total: number | null;
};

type ClientesTableProps = {
  rows: ClienteListRow[];
  grupos: { id: string; nombre: string }[];
};

export function ClientesTable({ rows, grupos }: ClientesTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = rows.filter((r) =>
    r.nombre_empresa.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <ClienteFormDialog grupos={grupos} />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Rubro</TableHead>
              <TableHead>Contacto principal</TableHead>
              <TableHead className="text-right">Ingreso bruto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/clientes/${row.id}`)}
              >
                <TableCell className="font-medium">{row.nombre_empresa}</TableCell>
                <TableCell>{row.grupo_nombre ?? "—"}</TableCell>
                <TableCell>{row.rubro ?? "—"}</TableCell>
                <TableCell>{row.contacto_principal ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.ingreso_bruto_total)}
                </TableCell>
                <TableCell>
                  <Badge variant={row.activo ? "success" : "secondary"}>
                    {row.activo ? "Activo" : "Inactivo"}
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
