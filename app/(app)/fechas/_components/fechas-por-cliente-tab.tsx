"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/domain/combobox";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { FechaClaveClienteFormDialog } from "@/components/domain/fecha-clave-cliente-form-dialog";
import { ORIGEN_OPTIONS } from "@/lib/validations";
import { deleteFechaClaveCliente } from "@/lib/actions/fechas-clave-cliente";
import type { FechaClaveCliente } from "@/lib/types";

const ORIGEN_LABEL = Object.fromEntries(ORIGEN_OPTIONS.map((o) => [o.value, o.label]));

export type FechaClaveClienteRow = FechaClaveCliente & { nombre_empresa: string };

type FechasPorClienteTabProps = {
  fechas: FechaClaveClienteRow[];
  clientes: { id: string; nombre_empresa: string }[];
};

export function FechasPorClienteTab({ fechas, clientes }: FechasPorClienteTabProps) {
  const router = useRouter();
  const [clienteFiltro, setClienteFiltro] = React.useState<string | null>(null);
  const [origenFiltro, setOrigenFiltro] = React.useState<string | null>(null);

  const filtered = fechas.filter((f) => {
    if (clienteFiltro && f.cliente_id !== clienteFiltro) return false;
    if (origenFiltro && f.origen !== origenFiltro) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Combobox
            options={clientes.map((c) => ({ value: c.id, label: c.nombre_empresa }))}
            value={clienteFiltro}
            onChange={setClienteFiltro}
            placeholder="Filtrar por cliente…"
            className="sm:w-56"
          />
          <Combobox
            options={ORIGEN_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={origenFiltro}
            onChange={setOrigenFiltro}
            placeholder="Filtrar por origen…"
            className="sm:w-56"
          />
        </div>
        <FechaClaveClienteFormDialog
          clientes={clientes}
          trigger={
            <Button size="sm">
              <Plus />
              Agregar fecha clave
            </Button>
          }
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Mes/Día</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="w-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Sin fechas clave.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.nombre_empresa}</TableCell>
                <TableCell>{f.nombre_fecha}</TableCell>
                <TableCell>
                  {f.mes ?? "—"}/{f.dia ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ORIGEN_LABEL[f.origen] ?? f.origen}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={f.activo ? "outline" : "secondary"}>
                    {f.activo ? "Sí" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <FechaClaveClienteFormDialog
                      clientes={clientes}
                      fecha={f}
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil />
                        </Button>
                      }
                    />
                    <DeleteAlertDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 />
                        </Button>
                      }
                      title="Eliminar fecha clave"
                      description={`¿Eliminar "${f.nombre_fecha}" de ${f.nombre_empresa}?`}
                      onConfirm={async () => {
                        const result = await deleteFechaClaveCliente(f.id, f.cliente_id);
                        router.refresh();
                        return result;
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
