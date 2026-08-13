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
import { ContactoFormDialog } from "./contacto-form-dialog";
import { deleteContacto } from "@/lib/actions/contactos";
import type { Contacto } from "@/lib/types";

type ContactosSectionProps = {
  clienteId: string;
  contactos: Contacto[];
};

export function ContactosSection({ clienteId, contactos }: ContactosSectionProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contactos</CardTitle>
        <ContactoFormDialog
          clienteId={clienteId}
          trigger={
            <Button size="sm">
              <Plus />
              Agregar contacto
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
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead></TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sin contactos registrados.
                  </TableCell>
                </TableRow>
              )}
              {contactos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>{c.telefono ?? "—"}</TableCell>
                  <TableCell>{c.cargo ?? "—"}</TableCell>
                  <TableCell>
                    {c.es_principal && <Badge>Principal</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ContactoFormDialog
                        clienteId={clienteId}
                        contacto={c}
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
                        title="Eliminar contacto"
                        description={`¿Eliminar a ${c.nombre}? Esta acción no se puede deshacer.`}
                        onConfirm={async () => {
                          const result = await deleteContacto(c.id, clienteId);
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
