import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { FechaClaveGroup } from "@/lib/group-fechas";

const PROXIMOS_DIAS_UMBRAL = 30;

function diasHasta(fecha: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - today.getTime()) / 86_400_000);
}

type FechasClaveCardsProps = {
  groups: FechaClaveGroup[];
};

export function FechasClaveCards({ groups }: FechasClaveCardsProps) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay fechas clave próximas registradas.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {groups.map((group) => {
        const dias = group.proximaFecha ? diasHasta(group.proximaFecha) : null;
        const esProxima = dias !== null && dias >= 0 && dias <= PROXIMOS_DIAS_UMBRAL;

        return (
          <Card
            key={group.key}
            className={esProxima ? "border-l-4 border-l-primary" : undefined}
          >
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
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {group.clientes.map((c) => (
                  <Link
                    key={c.fechaClaveId}
                    href={`/clientes/${c.clienteId}`}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs hover:underline"
                  >
                    {c.nombreEmpresa}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
