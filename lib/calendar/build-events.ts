import { agruparFechasClaveCliente, type FechaClaveClienteConNombre } from "@/lib/group-fechas";
import type { FechaGeneral } from "@/lib/types";
import { resolveDescripcionRegla } from "./date-rules";
import { colorKeyForCategoria, colorKeyForOrigen } from "./colors";
import type { CalendarEvent } from "./types";

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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
        draggable: false,
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
          draggable: false,
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
      draggable: true,
      fechaClaveIds: grupo.clientes.map((c) => c.fechaClaveId),
    });
  }

  return events;
}

// --- Fuentes de la Etapa 2.2: pedidos y eventos_calendario -----------------

export type PedidoCalendarioRow = {
  id: string;
  numero_pedido: string | null;
  fecha_entrega: string | null;
  fecha_entrega_artesano: string | null;
  fecha_pago: string | null;
  pagado: boolean | null;
  nro_factura: string | null;
  cliente_id: string;
  cliente_nombre: string;
  artesano_nombre: string | null;
};

const COLOR_ENTREGA_CLIENTE = "#2a78d6";
const COLOR_ENTREGA_ARTESANO = "#eb6834";
const COLOR_PAGO_FACTURA = "#1baf7a";

/** Un evento por cada fecha de pedido presente (entrega a cliente,
 * entrega del artesano, pago de factura). Cada pedido puede aportar
 * hasta 3 eventos independientes. */
export function buildPedidoEvents(pedidos: PedidoCalendarioRow[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const p of pedidos) {
    if (p.fecha_entrega) {
      events.push({
        id: `pc-${p.id}`,
        tipo: "pedido_entrega_cliente",
        fecha: parseLocalDate(p.fecha_entrega),
        nombre: `Entrega a cliente: ${p.cliente_nombre}`,
        categoria: "Entrega a cliente",
        colorKey: "pedido_entrega_cliente",
        colorHex: COLOR_ENTREGA_CLIENTE,
        draggable: true,
        pedidoId: p.id,
        linkHref: `/ventas/${p.id}`,
        linkLabel: `Ver pedido ${p.numero_pedido ?? ""}`.trim(),
      });
    }

    if (p.fecha_entrega_artesano) {
      events.push({
        id: `pa-${p.id}`,
        tipo: "pedido_entrega_artesano",
        fecha: parseLocalDate(p.fecha_entrega_artesano),
        nombre: `Entrega de ${p.artesano_nombre ?? "artesano"}: pedido ${p.numero_pedido ?? "s/n"}`,
        categoria: "Entrega de artesano",
        colorKey: "pedido_entrega_artesano",
        colorHex: COLOR_ENTREGA_ARTESANO,
        draggable: true,
        pedidoId: p.id,
        linkHref: `/ventas/${p.id}`,
        linkLabel: `Ver pedido ${p.numero_pedido ?? ""}`.trim(),
      });
    }

    if (p.fecha_pago && p.pagado) {
      events.push({
        id: `pp-${p.id}`,
        tipo: "pedido_pago",
        fecha: parseLocalDate(p.fecha_pago),
        nombre: `Pago factura ${p.nro_factura ?? "s/n"}: ${p.cliente_nombre}`,
        categoria: "Pago de factura",
        colorKey: "pedido_pago",
        colorHex: COLOR_PAGO_FACTURA,
        draggable: true,
        pedidoId: p.id,
        linkHref: `/ventas/${p.id}`,
        linkLabel: `Ver pedido ${p.numero_pedido ?? ""}`.trim(),
      });
    }
  }

  return events;
}

export type EventoCalendarioRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  fecha_fin: string | null;
  tipo_evento_id: string;
  tipo_evento_nombre: string;
  tipo_evento_color: string;
  cliente_id: string | null;
  cliente_nombre: string | null;
  pedido_id: string | null;
  pedido_numero: string | null;
};

/** Un evento por cada fila de eventos_calendario activa. Si tiene
 * fecha_fin se pinta como período (misma franja multi-día que ya se usa
 * para Vendimia), si no como evento puntual. */
export function buildEventoCalendarioEvents(rows: EventoCalendarioRow[]): CalendarEvent[] {
  return rows.map((row) => {
    const fechaFin = row.fecha_fin ? parseLocalDate(row.fecha_fin) : undefined;

    return {
      id: `ec-${row.id}`,
      tipo: "evento_calendario" as const,
      fecha: parseLocalDate(row.fecha),
      fechaFin,
      esPeriodo: Boolean(fechaFin),
      nombre: row.titulo,
      categoria: row.tipo_evento_nombre,
      colorKey: `evento-${row.tipo_evento_id}`,
      colorHex: row.tipo_evento_color,
      draggable: true,
      eventoCalendarioId: row.id,
      clientes:
        row.cliente_id && row.cliente_nombre
          ? [{ id: row.cliente_id, nombre_empresa: row.cliente_nombre }]
          : undefined,
      linkHref: row.pedido_id ? `/ventas/${row.pedido_id}` : undefined,
      linkLabel: row.pedido_id ? `Ver pedido ${row.pedido_numero ?? ""}`.trim() : undefined,
    };
  });
}
