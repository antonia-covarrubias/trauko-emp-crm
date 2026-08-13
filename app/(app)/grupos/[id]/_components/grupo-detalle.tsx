"use client";

import Link from "next/link";
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
import { GrupoFormDialog } from "../../_components/grupo-form-dialog";
import { deleteGrupo } from "@/lib/actions/grupos";

type GrupoDetalleProps = {
  grupo: { id: string; nombre: string; notas: string | null };
  clientes: { id: string; nombre_empresa: string; rubro: string | null; activo: boolean }[];
};

export function GrupoDetalle({ grupo, clientes }: GrupoDetalleProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{grupo.nombre}</h1>
          {grupo.notas && <p className="text-sm text-muted-foreground">{grupo.notas}</p>}
        </div>
        <div className="flex items-center gap-2">
          <GrupoFormDialog
            grupo={grupo}
            trigger={
              <Button variant="outline">
                <Pencil />
                Editar
              </Button>
            }
          />
          <DeleteAlertDialog
            trigger={
              <Button variant="destructive">
                <Trash2 />
                Eliminar grupo
              </Button>
            }
            title="Eliminar grupo"
            description={`¿Eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer.`}
            onConfirm={async () => {
              const result = await deleteGrupo(grupo.id);
              if (result.success) {
                router.push("/grupos");
              }
              return result;
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes del grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rubro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Este grupo todavía no tiene clientes asociados.
                    </TableCell>
                  </TableRow>
                )}
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clientes/${c.id}`} className="hover:underline">
                        {c.nombre_empresa}
                      </Link>
                    </TableCell>
                    <TableCell>{c.rubro ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.activo ? "outline" : "secondary"}>
                        {c.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
