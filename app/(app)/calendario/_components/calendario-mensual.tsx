"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buildFechaGeneralEvents, buildFechaClienteEvents } from "@/lib/calendar/build-events";
import { CALENDAR_LEGEND, dotClassName } from "@/lib/calendar/colors";
import type { CalendarEvent } from "@/lib/calendar/types";
import type { FechaGeneral } from "@/lib/types";
import type { FechaClaveClienteConNombre } from "@/lib/group-fechas";
import { buildMonthGrid, dateKey, diffDays, isSameDay } from "./grid-utils";
import { DiaDetalleDialog } from "./dia-detalle-dialog";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_CHIPS_POR_DIA = 3;

function inicioDelDia(d: Date) {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

type Segmento = { evento: CalendarEvent; startCol: number; endCol: number };

function segmentosDePeriodoParaSemana(semana: Date[], periodos: CalendarEvent[]): Segmento[] {
  const inicioSemana = semana[0];
  const finSemana = semana[6];
  const segmentos: Segmento[] = [];

  for (const evento of periodos) {
    const inicioEvento = evento.fecha;
    const finEvento = evento.fechaFin!;
    if (finEvento < inicioSemana || inicioEvento > finSemana) continue;

    const segInicio = inicioEvento < inicioSemana ? inicioSemana : inicioEvento;
    const segFin = finEvento > finSemana ? finSemana : finEvento;
    segmentos.push({
      evento,
      startCol: diffDays(segInicio, inicioSemana),
      endCol: diffDays(segFin, inicioSemana),
    });
  }

  return segmentos;
}

type CalendarioMensualProps = {
  fechasGenerales: FechaGeneral[];
  filasFechasClave: FechaClaveClienteConNombre[];
};

export function CalendarioMensual({
  fechasGenerales,
  filasFechasClave,
}: CalendarioMensualProps) {
  const hoy = React.useMemo(() => inicioDelDia(new Date()), []);
  const [viewDate, setViewDate] = React.useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const fechasGeneralesById = React.useMemo(
    () => new Map(fechasGenerales.map((fg) => [fg.id, fg])),
    [fechasGenerales],
  );

  const { eventosPorDia, periodos } = React.useMemo(() => {
    const years = new Set([
      viewDate.getFullYear() - 1,
      viewDate.getFullYear(),
      viewDate.getFullYear() + 1,
    ]);
    const todos: CalendarEvent[] = [];
    for (const year of years) {
      todos.push(...buildFechaGeneralEvents(fechasGenerales, year));
      todos.push(...buildFechaClienteEvents(filasFechasClave, fechasGeneralesById, year));
    }

    const puntuales = todos.filter((e) => !e.esPeriodo);
    const periodos = todos.filter((e) => e.esPeriodo && e.fechaFin);

    const eventosPorDia = new Map<string, CalendarEvent[]>();
    for (const e of puntuales) {
      const key = dateKey(e.fecha);
      const lista = eventosPorDia.get(key) ?? [];
      lista.push(e);
      eventosPorDia.set(key, lista);
    }

    return { eventosPorDia, periodos };
  }, [fechasGenerales, filasFechasClave, fechasGeneralesById, viewDate]);

  const semanas = React.useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  function eventosDelDia(d: Date): CalendarEvent[] {
    const puntualesDelDia = eventosPorDia.get(dateKey(d)) ?? [];
    const periodosDelDia = periodos.filter((e) => d >= e.fecha && d <= e.fechaFin!);
    return [...periodosDelDia, ...puntualesDelDia];
  }

  const tituloMesRaw = viewDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  const tituloMes = tituloMesRaw.charAt(0).toUpperCase() + tituloMesRaw.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{tituloMes}</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1))}
              >
                Hoy
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Mes anterior"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Mes siguiente"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="py-1">
                {dia}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-px overflow-hidden rounded-md border bg-border">
            {semanas.map((semana, semanaIndex) => {
              const segmentos = segmentosDePeriodoParaSemana(semana, periodos);

              return (
                <div key={semanaIndex} className="flex flex-col gap-px bg-border">
                  {segmentos.length > 0 && (
                    <div className="grid grid-cols-7 gap-px bg-background px-px pt-1">
                      {segmentos.map((seg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white",
                            dotClassName(seg.evento.colorKey),
                          )}
                          style={{ gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}` }}
                          title={seg.evento.nombre}
                        >
                          {seg.evento.nombre}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-7 gap-px bg-border">
                    {semana.map((dia) => {
                      const esMesActual = dia.getMonth() === viewDate.getMonth();
                      const esHoy = isSameDay(dia, hoy);
                      const eventosDia = eventosPorDia.get(dateKey(dia)) ?? [];
                      const visibles = eventosDia.slice(0, MAX_CHIPS_POR_DIA);
                      const restantes = eventosDia.length - visibles.length;

                      return (
                        <button
                          type="button"
                          key={dia.toISOString()}
                          onClick={() => setSelectedDate(dia)}
                          className={cn(
                            "flex min-h-24 flex-col items-start gap-1 bg-background p-1.5 text-left transition-colors hover:bg-muted",
                            !esMesActual && "opacity-40",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full text-xs",
                              esHoy && "bg-primary font-semibold text-primary-foreground",
                            )}
                          >
                            {dia.getDate()}
                          </span>
                          <div className="flex w-full flex-col gap-0.5">
                            {visibles.map((ev) => (
                              <span
                                key={ev.id}
                                className="flex items-center gap-1 truncate text-[11px] text-foreground"
                              >
                                <span
                                  className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    dotClassName(ev.colorKey),
                                  )}
                                />
                                <span className="truncate">{ev.nombre}</span>
                              </span>
                            ))}
                            {restantes > 0 && (
                              <span className="text-[11px] text-muted-foreground">
                                +{restantes} más
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            {CALENDAR_LEGEND.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("size-2 rounded-full", dotClassName(item.key))} />
                {item.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DiaDetalleDialog
        fecha={selectedDate}
        eventos={selectedDate ? eventosDelDia(selectedDate) : []}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
    </div>
  );
}
