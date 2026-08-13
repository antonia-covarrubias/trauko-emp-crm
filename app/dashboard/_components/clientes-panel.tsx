"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type { VentaPorCliente, VentaPorGrupo } from "./types";

type Row = {
  id: string;
  nombre: string;
  rubro: string | null;
  total_pedidos: number | null;
  ingreso_bruto_total: number | null;
  ultima_fecha_entrega: string | null;
  clickable: boolean;
};

type SortColumn =
  | "nombre"
  | "rubro"
  | "total_pedidos"
  | "ingreso_bruto_total"
  | "ultima_fecha_entrega";

type ClientesPanelProps = {
  clientes: VentaPorCliente[];
  grupos: VentaPorGrupo[];
};

const COLUMNS: { key: SortColumn; label: string; align?: "right" }[] = [
  { key: "nombre", label: "Empresa" },
  { key: "rubro", label: "Rubro" },
  { key: "total_pedidos", label: "Pedidos", align: "right" },
  { key: "ingreso_bruto_total", label: "Ingreso bruto", align: "right" },
  { key: "ultima_fecha_entrega", label: "Última entrega" },
];

export function ClientesPanel({ clientes, grupos }: ClientesPanelProps) {
  const router = useRouter();
  const [view, setView] = useState<"cliente" | "grupo">("cliente");
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(
    "ingreso_bruto_total",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const rows = useMemo<Row[]>(() => {
    if (view === "cliente") {
      return clientes.map((c) => ({
        id: c.cliente_id,
        nombre: c.nombre_empresa ?? "—",
        rubro: c.rubro,
        total_pedidos: c.total_pedidos,
        ingreso_bruto_total: c.ingreso_bruto_total,
        ultima_fecha_entrega: c.ultima_fecha_entrega,
        clickable: true,
      }));
    }
    return grupos.map((g) => ({
      id: g.grupo_id,
      nombre: g.grupo_nombre ?? "—",
      rubro: null,
      total_pedidos: g.total_pedidos,
      ingreso_bruto_total: g.ingreso_bruto_total,
      ultima_fecha_entrega: g.ultima_fecha_entrega,
      clickable: false,
    }));
  }, [view, clientes, grupos]);

  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? rows.filter((r) => r.nombre.toLowerCase().includes(term))
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "asc" ? av - bv : bv - av;
      }

      const comparison = String(av).localeCompare(String(bv), "es");
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [rows, search, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={
            view === "cliente" ? "Buscar por empresa…" : "Buscar por grupo…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="inline-flex rounded-md border p-1">
          <Button
            type="button"
            size="sm"
            variant={view === "cliente" ? "default" : "ghost"}
            onClick={() => setView("cliente")}
          >
            Cliente
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "grupo" ? "default" : "ghost"}
            onClick={() => setView("grupo")}
          >
            Grupo
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.align === "right" && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-foreground",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.label}
                    {sortColumn === col.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 opacity-40" />
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
            {filteredAndSorted.map((row) => (
              <TableRow
                key={row.id}
                onClick={() =>
                  row.clickable && router.push(`/clientes/${row.id}`)
                }
                className={cn(row.clickable && "cursor-pointer")}
              >
                <TableCell className="font-medium">{row.nombre}</TableCell>
                <TableCell>{row.rubro ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {row.total_pedidos ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(row.ingreso_bruto_total)}
                </TableCell>
                <TableCell>{formatDate(row.ultima_fecha_entrega)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
