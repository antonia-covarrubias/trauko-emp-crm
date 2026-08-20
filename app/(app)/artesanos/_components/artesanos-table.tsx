"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
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
import { ArtesanoFormDialog } from "./artesano-form-dialog";
import { deleteArtesano } from "@/lib/actions/artesanos";
import type { Artesano } from "@/lib/types";

type ArtesanosTableProps = {
  artesanos: Artesano[];
};

export function ArtesanosTable({ artesanos }: ArtesanosTableProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Artesanos</CardTitle>
        <ArtesanoFormDialog />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artesanos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Sin artesanos registrados.
                  </TableCell>
                </TableRow>
              )}
              {artesanos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nombre}</TableCell>
                  <TableCell>{a.especialidad ?? "—"}</TableCell>
                  <TableCell>{a.contacto ?? "—"}</TableCell>
                  <TableCell>{a.telefono ?? "—"}</TableCell>
                  <TableCell>{a.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={a.activo ? "success" : "secondary"}>
                      {a.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ArtesanoFormDialog
                        artesano={a}
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
                        title="Eliminar artesano"
                        description={`¿Eliminar a ${a.nombre}? Esta acción no se puede deshacer.`}
                        onConfirm={async () => {
                          const result = await deleteArtesano(a.id);
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
