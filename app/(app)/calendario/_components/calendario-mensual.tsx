"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildFechaGeneralEvents,
  buildFechaClienteEvents,
  buildPedidoEvents,
  buildEventoCalendarioEvents,
  type PedidoCalendarioRow,
  type EventoCalendarioRow,
} from "@/lib/calendar/build-events";
import { CALENDAR_LEGEND, dotClassName, hexDotStyle } from "@/lib/calendar/colors";
import {
  moverPedidoEntregaCliente,
  moverPedidoEntregaArtesano,
  moverPedidoPago,
  moverFechaClaveCliente,
} from "@/lib/actions/calendario";
import { moverEventoCalendario } from "@/lib/actions/eventos-calendario";
import type { CalendarEvent } from "@/lib/calendar/types";
import type { ActionResult, FechaGeneral, TipoEvento } from "@/lib/types";
import type { FechaClaveClienteConNombre } from "@/lib/group-fechas";
import { buildMonthGrid, dateKey, diffDays, isSameDay } from "./grid-utils";
import { DiaDetalleDialog } from "./dia-detalle-dialog";
import { EventoCalendarioFormDialog } from "./evento-calendario-form-dialog";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_CHIPS_POR_DIA = 3;
const OVERRIDE_TTL_MS = 1500;

function inicioDelDia(d: Date) {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function addDays(d: Date, n: number) {
  const copia = new Date(d);
  copia.setDate(copia.getDate() + n);
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

async function moverEvento(ev: CalendarEvent, nuevaFecha: Date): Promise<ActionResult> {
  switch (ev.tipo) {
    case "pedido_entrega_cliente":
      return moverPedidoEntregaCliente(ev.pedidoId!, dateKey(nuevaFecha));
    case "pedido_entrega_artesano":
      return moverPedidoEntregaArtesano(ev.pedidoId!, dateKey(nuevaFecha));
    case "pedido_pago":
      return moverPedidoPago(ev.pedidoId!, dateKey(nuevaFecha));
    case "fecha_cliente":
      return moverFechaClaveCliente(
        ev.fechaClaveIds ?? [],
        nuevaFecha.getMonth() + 1,
        nuevaFecha.getDate(),
      );
    case "evento_calendario": {
      let nuevaFechaFin: string | null = null;
      if (ev.fechaFin) {
        const delta = diffDays(nuevaFecha, ev.fecha);
        nuevaFechaFin = dateKey(addDays(ev.fechaFin, delta));
      }
      return moverEventoCalendario(ev.eventoCalendarioId!, dateKey(nuevaFecha), nuevaFechaFin);
    }
    default:
      return { success: false, error: "Este evento no se puede mover." };
  }
}

type CalendarioMensualProps = {
  fechasGenerales: FechaGeneral[];
  filasFechasClave: FechaClaveClienteConNombre[];
  pedidos: PedidoCalendarioRow[];
  eventosCalendario: EventoCalendarioRow[];
  tiposEvento: TipoEvento[];
  clientes: { id: string; nombre_empresa: string }[];
  pedidosOptions: { id: string; numero_pedido: string | null; cliente_nombre: string }[];
};

export function CalendarioMensual({
  fechasGenerales,
  filasFechasClave,
  pedidos,
  eventosCalendario,
  tiposEvento,
  clientes,
  pedidosOptions,
}: CalendarioMensualProps) {
  const router = useRouter();
  const hoy = React.useMemo(() => inicioDelDia(new Date()), []);
  const [viewDate, setViewDate] = React.useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = React.useState<CalendarEvent | null>(null);
  const [dragOverKey, setDragOverKey] = React.useState<string | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, Date>>({});
  const [eventoForm, setEventoForm] = React.useState<{
    open: boolean;
    evento?: EventoCalendarioRow;
    presetFecha?: Date;
  }>({ open: false });

  const fechasGeneralesById = React.useMemo(
    () => new Map(fechasGenerales.map((fg) => [fg.id, fg])),
    [fechasGenerales],
  );

  const eventosCalendarioById = React.useMemo(
    () => new Map(eventosCalendario.map((e) => [e.id, e])),
    [eventosCalendario],
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
    todos.push(...buildPedidoEvents(pedidos));
    todos.push(...buildEventoCalendarioEvents(eventosCalendario));

    const conOverrides = todos.map((ev) => {
      const nuevaFecha = overrides[ev.id];
      if (!nuevaFecha) return ev;
      const delta = diffDays(nuevaFecha, ev.fecha);
      return {
        ...ev,
        fecha: nuevaFecha,
        fechaFin: ev.fechaFin ? addDays(ev.fechaFin, delta) : undefined,
      };
    });

    const puntuales = conOverrides.filter((e) => !e.esPeriodo);
    const periodos = conOverrides.filter((e) => e.esPeriodo && e.fechaFin);

    const eventosPorDia = new Map<string, CalendarEvent[]>();
    for (const e of puntuales) {
      const key = dateKey(e.fecha);
      const lista = eventosPorDia.get(key) ?? [];
      lista.push(e);
      eventosPorDia.set(key, lista);
    }

    return { eventosPorDia, periodos };
  }, [fechasGenerales, filasFechasClave, pedidos, eventosCalendario, fechasGeneralesById, viewDate, overrides]);

  const semanas = React.useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  function eventosDelDia(d: Date): CalendarEvent[] {
    const puntualesDelDia = eventosPorDia.get(dateKey(d)) ?? [];
    const periodosDelDia = periodos.filter((e) => d >= e.fecha && d <= e.fechaFin!);
    return [...periodosDelDia, ...puntualesDelDia];
  }

  function handleDragStart(ev: CalendarEvent) {
    if (!ev.draggable) return;
    setDraggedEvent(ev);
  }

  function handleDrop(targetDate: Date) {
    setDragOverKey(null);
    const original = draggedEvent;
    setDraggedEvent(null);
    if (!original || !original.draggable) return;
    if (isSameDay(original.fecha, targetDate)) return;

    setOverrides((prev) => ({ ...prev, [original.id]: targetDate }));

    moverEvento(original, targetDate).then((result) => {
      if (!result.success) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[original.id];
          return next;
        });
        toast.error(result.error ?? "No se pudo mover el evento.");
        return;
      }

      const fechaLabel = targetDate.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
      });
      toast.success(`"${original.nombre}" movido al ${fechaLabel}.`);
      router.refresh();
      setTimeout(() => {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[original.id];
          return next;
        });
      }, OVERRIDE_TTL_MS);
    });
  }

  function handleEditEventoCalendario(ev: CalendarEvent) {
    const raw = ev.eventoCalendarioId ? eventosCalendarioById.get(ev.eventoCalendarioId) : undefined;
    setSelectedDate(null);
    setEventoForm({ open: true, evento: raw, presetFecha: undefined });
  }

  function handleNuevoEvento(presetFecha?: Date) {
    setSelectedDate(null);
    setEventoForm({ open: true, evento: undefined, presetFecha });
  }

  const tituloMesRaw = viewDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  const tituloMes = tituloMesRaw.charAt(0).toUpperCase() + tituloMesRaw.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
              <Button type="button" size="sm" onClick={() => handleNuevoEvento(hoy)}>
                <Plus />
                Nuevo evento
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
                          draggable={seg.evento.draggable}
                          onDragStart={() => handleDragStart(seg.evento)}
                          onDragEnd={() => setDraggedEvent(null)}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white",
                            seg.evento.draggable ? "cursor-grab" : "cursor-default",
                            !seg.evento.colorHex && dotClassName(seg.evento.colorKey),
                          )}
                          style={{
                            gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                            ...(seg.evento.colorHex ? { backgroundColor: seg.evento.colorHex } : {}),
                          }}
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
                      const key = dateKey(dia);
                      const eventosDia = eventosPorDia.get(key) ?? [];
                      const visibles = eventosDia.slice(0, MAX_CHIPS_POR_DIA);
                      const restantes = eventosDia.length - visibles.length;

                      return (
                        <button
                          type="button"
                          key={dia.toISOString()}
                          onClick={() => setSelectedDate(dia)}
                          onDragOver={(e) => {
                            if (!draggedEvent) return;
                            e.preventDefault();
                            setDragOverKey(key);
                          }}
                          onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDrop(dia);
                          }}
                          className={cn(
                            "flex min-h-24 flex-col items-start gap-1 bg-background p-1.5 text-left transition-colors hover:bg-muted",
                            !esMesActual && "opacity-40",
                            dragOverKey === key && "bg-primary/10 ring-2 ring-inset ring-primary",
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
                                draggable={ev.draggable}
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(ev);
                                }}
                                onDragEnd={() => setDraggedEvent(null)}
                                className={cn(
                                  "flex items-center gap-1 truncate text-[11px] text-foreground",
                                  ev.draggable ? "cursor-grab" : "cursor-default",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    !ev.colorHex && dotClassName(ev.colorKey),
                                  )}
                                  style={ev.colorHex ? hexDotStyle(ev.colorHex) : undefined}
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
            {tiposEvento.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full" style={hexDotStyle(t.color)} />
                {t.nombre}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DiaDetalleDialog
        fecha={selectedDate}
        eventos={selectedDate ? eventosDelDia(selectedDate) : []}
        onOpenChange={(open) => !open && setSelectedDate(null)}
        onEditEventoCalendario={handleEditEventoCalendario}
        onNuevoEvento={() => selectedDate && handleNuevoEvento(selectedDate)}
      />

      <EventoCalendarioFormDialog
        open={eventoForm.open}
        onOpenChange={(open) => setEventoForm((s) => ({ ...s, open }))}
        tiposEvento={tiposEvento}
        clientes={clientes}
        pedidos={pedidosOptions}
        evento={eventoForm.evento}
        presetFecha={eventoForm.presetFecha}
      />
    </div>
  );
}
