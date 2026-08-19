import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { badgeVariant } from "@/lib/calendar/colors";
import type { CalendarEvent } from "@/lib/calendar/types";

type DiaDetalleDialogProps = {
  fecha: Date | null;
  eventos: CalendarEvent[];
  onOpenChange: (open: boolean) => void;
};

export function DiaDetalleDialog({ fecha, eventos, onOpenChange }: DiaDetalleDialogProps) {
  return (
    <Dialog open={fecha !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {fecha
              ? fecha.toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </DialogTitle>
          <DialogDescription>
            {eventos.length === 0
              ? "Sin fechas registradas este día."
              : `${eventos.length} fecha${eventos.length === 1 ? "" : "s"} registrada${eventos.length === 1 ? "" : "s"}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {eventos.map((ev) => (
            <div key={ev.id} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{ev.nombre}</span>
                <Badge variant={badgeVariant(ev.colorKey)}>
                  {ev.esPeriodo
                    ? "Período"
                    : ev.tipo === "fecha_general"
                      ? (ev.categoria ?? "General")
                      : "Cliente"}
                </Badge>
              </div>

              {ev.esPeriodo && ev.fechaFin && (
                <p className="text-xs text-muted-foreground">
                  {ev.fecha.toLocaleDateString("es-CL")} – {ev.fechaFin.toLocaleDateString("es-CL")}
                </p>
              )}

              {ev.clientes && ev.clientes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ev.clientes.map((c) => (
                    <Link
                      key={c.id}
                      href={`/clientes/${c.id}`}
                      className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs hover:underline"
                    >
                      {c.nombre_empresa}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
