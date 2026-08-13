"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { FechaClaveClienteFormDialog } from "@/components/domain/fecha-clave-cliente-form-dialog";
import { ORIGEN_OPTIONS } from "@/lib/validations";
import { deleteFechaClaveCliente } from "@/lib/actions/fechas-clave-cliente";
import type { FechaClaveCliente } from "@/lib/types";

const ORIGEN_LABEL = Object.fromEntries(ORIGEN_OPTIONS.map((o) => [o.value, o.label]));

type FechasClaveSectionProps = {
  clienteId: string;
  fechas: FechaClaveCliente[];
};

export function FechasClaveSection({ clienteId, fechas }: FechasClaveSectionProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fechas clave</CardTitle>
        <FechaClaveClienteFormDialog
          clienteId={clienteId}
          trigger={
            <Button size="sm">
              <Plus />
              Agregar fecha clave
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Mes/Día</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fechas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sin fechas clave registradas.
                  </TableCell>
                </TableRow>
              )}
              {fechas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">
                    {f.nombre_fecha}
                    {!f.activo && (
                      <Badge variant="secondary" className="ml-2">
                        Inactiva
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {f.mes ?? "—"}/{f.dia ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ORIGEN_LABEL[f.origen] ?? f.origen}</Badge>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">{f.notas ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <FechaClaveClienteFormDialog
                        clienteId={clienteId}
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
                        description={`¿Eliminar "${f.nombre_fecha}"? Esta acción no se puede deshacer.`}
                        onConfirm={async () => {
                          const result = await deleteFechaClaveCliente(f.id, clienteId);
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
      </CardContent>
    </Card>
  );
}
