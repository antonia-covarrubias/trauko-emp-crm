import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import type { FechaClave } from "./types";

const ORIGEN_LABEL: Record<string, string> = {
  confirmado_cliente: "Confirmada por cliente",
  sugerido_rubro: "Sugerida por rubro",
  fecha_nacional: "Fecha nacional",
};

const ORIGEN_CLASSNAME: Record<string, string> = {
  confirmado_cliente:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  sugerido_rubro:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  fecha_nacional:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

const PROXIMOS_DIAS_UMBRAL = 30;

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

type FechasClaveListProps = {
  fechas: FechaClave[];
};

export function FechasClaveList({ fechas }: FechasClaveListProps) {
  if (fechas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay fechas clave próximas registradas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {fechas.map((f) => {
        const dias = daysUntil(f.proxima_fecha);
        const esProxima = dias >= 0 && dias <= PROXIMOS_DIAS_UMBRAL;

        return (
          <li
            key={f.fecha_clave_id}
            className={cn(
              "flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between",
              esProxima && "border-l-4 border-l-primary",
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{f.nombre_fecha ?? "—"}</span>
                <Badge
                  variant="outline"
                  className={cn("border-transparent", ORIGEN_CLASSNAME[f.origen])}
                >
                  {ORIGEN_LABEL[f.origen] ?? f.origen}
                </Badge>
                {esProxima && (
                  <Badge variant="outline">
                    {dias === 0 ? "Hoy" : `En ${dias} días`}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {f.nombre_empresa ?? "—"}
                {f.grupo_nombre && f.grupo_nombre !== f.nombre_empresa
                  ? ` · ${f.grupo_nombre}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-col gap-0.5 text-sm sm:items-end">
              <span className="font-medium">{formatDate(f.proxima_fecha)}</span>
              <span className="text-muted-foreground">
                Ingreso bruto cliente: {formatCurrency(f.ingreso_bruto_total)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
