"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ejecutivoSchema, type EjecutivoFormValues } from "@/lib/validations";
import { createEjecutivo, updateEjecutivo } from "@/lib/actions/ejecutivos";
import type { Ejecutivo } from "@/lib/types";

function EjecutivoRow({ ejecutivo }: { ejecutivo: Ejecutivo }) {
  const router = useRouter();
  const form = useForm<EjecutivoFormValues>({
    resolver: zodResolver(ejecutivoSchema),
    defaultValues: { nombre: ejecutivo.nombre, activo: ejecutivo.activo },
  });

  async function onSubmit(values: EjecutivoFormValues) {
    const result = await updateEjecutivo(ejecutivo.id, values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Ejecutivo actualizado.");
    form.reset(values);
    router.refresh();
  }

  return (
    <TableRow>
      <TableCell>
        <Input {...form.register("nombre")} className="max-w-xs" />
      </TableCell>
      <TableCell>
        <Switch
          checked={form.watch("activo")}
          onCheckedChange={(checked) => form.setValue("activo", checked, { shouldDirty: true })}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          Guardar
        </Button>
      </TableCell>
    </TableRow>
  );
}

type EjecutivosTableProps = {
  ejecutivos: Ejecutivo[];
};

export function EjecutivosTable({ ejecutivos }: EjecutivosTableProps) {
  const router = useRouter();
  const [nuevoNombre, setNuevoNombre] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  async function handleCreate() {
    if (!nuevoNombre.trim()) return;
    setIsCreating(true);
    const result = await createEjecutivo({ nombre: nuevoNombre.trim(), activo: true });
    setIsCreating(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Ejecutivo agregado.");
    setNuevoNombre("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ejecutivos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nombre del nuevo ejecutivo…"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Button onClick={handleCreate} disabled={isCreating || !nuevoNombre.trim()}>
            <Plus />
            Agregar
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ejecutivos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sin ejecutivos registrados.
                  </TableCell>
                </TableRow>
              )}
              {ejecutivos.map((e) => (
                <EjecutivoRow key={e.id} ejecutivo={e} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
