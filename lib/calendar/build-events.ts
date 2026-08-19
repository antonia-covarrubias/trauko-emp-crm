import { agruparFechasClaveCliente, type FechaClaveClienteConNombre } from "@/lib/group-fechas";
import type { FechaGeneral } from "@/lib/types";
import { resolveDescripcionRegla } from "./date-rules";
import { colorKeyForCategoria, colorKeyForOrigen } from "./colors";
import type { CalendarEvent } from "./types";

/** Genera los eventos de fechas_generales para un año dado: fechas fijas
 * (mes/dia), fechas variables con regla conocida (2° domingo de mayo,
 * etc.), y períodos (Vendimia). Las reglas no reconocidas se omiten. */
export function buildFechaGeneralEvents(
  fechasGenerales: FechaGeneral[],
  year: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const fg of fechasGenerales) {
    if (fg.mes && fg.dia) {
      events.push({
        id: `fg-${fg.id}-${year}`,
        tipo: "fecha_general",
        fecha: new Date(year, fg.mes - 1, fg.dia),
        nombre: fg.nombre,
        categoria: fg.categoria,
        colorKey: colorKeyForCategoria(fg.categoria),
      });
      continue;
    }

    if (fg.descripcion_regla) {
      const resuelta = resolveDescripcionRegla(fg.descripcion_regla, year);
      if (resuelta) {
        events.push({
          id: `fg-${fg.id}-${year}`,
          tipo: "fecha_general",
          fecha: resuelta.fecha,
          fechaFin: resuelta.fechaFin,
          esPeriodo: Boolean(resuelta.fechaFin),
          nombre: fg.nombre,
          categoria: fg.categoria,
          colorKey: colorKeyForCategoria(fg.categoria),
        });
      }
    }
  }

  return events;
}

/** Genera los eventos de fechas_clave_cliente para un año dado,
 * agrupando por (nombre_fecha, mes, dia) / fecha_general_id igual que
 * la vista de Fechas clave. Cuando el grupo viene de un fecha_general_id,
 * usa el mes/dia (o la regla resuelta) de esa fecha general para
 * ubicarlo -- es la fuente más confiable, especialmente para fechas
 * variables. Grupos sin una fecha resoluble (fecha propia variable sin
 * fecha_general_id) se omiten del calendario. */
export function buildFechaClienteEvents(
  rows: FechaClaveClienteConNombre[],
  fechasGeneralesById: Map<string, FechaGeneral>,
  year: number,
): CalendarEvent[] {
  const grupos = agruparFechasClaveCliente(rows);
  const events: CalendarEvent[] = [];

  for (const grupo of grupos) {
    let fecha: Date | null = null;

    if (grupo.fechaGeneralId) {
      const fg = fechasGeneralesById.get(grupo.fechaGeneralId);
      if (fg) {
        if (fg.mes && fg.dia) {
          fecha = new Date(year, fg.mes - 1, fg.dia);
        } else if (fg.descripcion_regla) {
          const resuelta = resolveDescripcionRegla(fg.descripcion_regla, year);
          if (resuelta) fecha = resuelta.fecha;
        }
      }
    }

    if (!fecha && grupo.mes && grupo.dia) {
      fecha = new Date(year, grupo.mes - 1, grupo.dia);
    }

    if (!fecha) continue;

    const primerOrigen = grupo.clientes[0]?.origen ?? null;

    events.push({
      id: `fc-${grupo.key}-${year}`,
      tipo: "fecha_cliente",
      fecha,
      nombre: grupo.nombreFecha,
      clientes: grupo.clientes.map((c) => ({ id: c.clienteId, nombre_empresa: c.nombreEmpresa })),
      colorKey: colorKeyForOrigen(primerOrigen),
    });
  }

  return events;
}
