"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAlertDialog } from "@/components/domain/delete-alert-dialog";
import { deleteFechaClaveCliente } from "@/lib/actions/fechas-clave-cliente";
import { AgregarClientesDialog } from "./agregar-clientes-dialog";
import type { FechaClaveGroup } from "@/lib/group-fechas";

const PROXIMOS_DIAS_UMBRAL = 30;

function diasHasta(fecha: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - today.getTime()) / 86_400_000);
}

type FechaClaveGroupCardProps = {
  group: FechaClaveGroup;
  clientesActivos: { id: string; nombre_empresa: string }[];
};

export function FechaClaveGroupCard({ group, clientesActivos }: FechaClaveGroupCardProps) {
  const router = useRouter();

  const dias = group.proximaFecha ? diasHasta(group.proximaFecha) : null;
  const esProxima = dias !== null && dias >= 0 && dias <= PROXIMOS_DIAS_UMBRAL;

  const yaAsociadosIds = new Set(group.clientes.map((c) => c.clienteId));
  const disponibles = clientesActivos.filter((c) => !yaAsociadosIds.has(c.id));

  return (
    <Card className={esProxima ? "border-l-4 border-l-primary" : undefined}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>{group.nombreFecha}</CardTitle>
        {group.proximaFecha ? (
          <div className="flex items-center gap-2">
            <Badge variant={esProxima ? "info" : "outline"}>
              {group.proximaFecha.toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "long",
              })}
            </Badge>
            {esProxima && (
              <Badge variant="warning">{dias === 0 ? "Hoy" : `En ${dias} días`}</Badge>
            )}
          </div>
        ) : (
          <Badge variant="outline">Fecha variable</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {group.clientes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin clientes asociados todavía.</p>
          )}
          {group.clientes.map((c) => (
            <span
              key={c.fechaClaveId}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted py-1 pr-1 pl-3 text-xs"
            >
              <Link href={`/clientes/${c.clienteId}`} className="hover:underline">
                {c.nombreEmpresa}
              </Link>
              <DeleteAlertDialog
                trigger={
                  <button
                    type="button"
                    aria-label={`Quitar a ${c.nombreEmpresa} de ${group.nombreFecha}`}
                    className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                }
                title="Quitar cliente de esta fecha"
                description={`¿Quitar a ${c.nombreEmpresa} de "${group.nombreFecha}"? Esta acción no se puede deshacer.`}
                onConfirm={async () => {
                  const result = await deleteFechaClaveCliente(c.fechaClaveId, c.clienteId);
                  router.refresh();
                  return result;
                }}
              />
            </span>
          ))}
        </div>

        <div>
          <AgregarClientesDialog
            nombreFecha={group.nombreFecha}
            mes={group.mes}
            dia={group.dia}
            fechaGeneralId={group.fechaGeneralId}
            clientesDisponibles={disponibles}
          />
        </div>
      </CardContent>
    </Card>
  );
}
