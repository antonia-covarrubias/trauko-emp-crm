"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { FechaGeneralFormDialog } from "./fecha-general-form-dialog";
import { deleteFechaGeneral } from "@/lib/actions/fechas-generales";
import type { FechaGeneral } from "@/lib/types";

type CalendarioGeneralTabProps = {
  fechas: FechaGeneral[];
};

export function CalendarioGeneralTab({ fechas }: CalendarioGeneralTabProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <FechaGeneralFormDialog
          trigger={
            <Button size="sm">
              <Plus />
              Nueva fecha
            </Button>
          }
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Mes/Día</TableHead>
              <TableHead>Regla</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="w-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fechas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Sin fechas en el calendario general.
                </TableCell>
              </TableRow>
            )}
            {fechas.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.nombre}</TableCell>
                <TableCell>
                  {f.mes ?? "—"}/{f.dia ?? "variable"}
                </TableCell>
                <TableCell>{f.descripcion_regla ?? "—"}</TableCell>
                <TableCell>{f.categoria ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <FechaGeneralFormDialog
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
                      title="Eliminar fecha"
                      description={`¿Eliminar "${f.nombre}" del calendario general?`}
                      onConfirm={async () => {
                        const result = await deleteFechaGeneral(f.id);
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
