/** Un evento ya resuelto a una fecha concreta (o período) dentro de un
 * año específico, listo para ubicar en la grilla del calendario.
 *
 * Pensado para crecer: agregar un nuevo tipo de evento (alertas,
 * producción) es sumar un `tipo` nuevo y una función
 * `buildXxxEvents(...)` -- el componente del calendario en sí no
 * necesita cambiar, solo itera sobre `CalendarEvent[]`. */
export type CalendarEventTipo =
  | "fecha_general"
  | "fecha_cliente"
  | "pedido_entrega_cliente"
  | "pedido_entrega_artesano"
  | "pedido_pago"
  | "evento_calendario";

export type CalendarEvent = {
  id: string;
  tipo: CalendarEventTipo;
  fecha: Date;
  nombre: string;
  categoria?: string | null;
  clientes?: { id: string; nombre_empresa: string }[];
  esPeriodo?: boolean;
  fechaFin?: Date;
  /** Clave de color/leyenda de la paleta fija -- ver lib/calendar/colors.ts */
  colorKey: string;
  /** Color literal (hex) cuando el evento no usa la paleta de 5 colores
   * fija sino un color propio (pedidos, eventos_calendario). Si está
   * presente, tiene prioridad sobre colorKey para pintar. */
  colorHex?: string;
  /** Si se puede arrastrar a otro día. Las fechas_generales quedan de
   * solo lectura -- se editan desde su propio CRUD. */
  draggable: boolean;
  /** Id del pedido de origen, para los tipos pedido_* (drag y link). */
  pedidoId?: string;
  /** Ids de fechas_clave_cliente que representa este evento agrupado
   * (puede ser más de uno si varios clientes comparten la misma fecha),
   * para el drag de fecha_cliente. */
  fechaClaveIds?: string[];
  /** Id del registro eventos_calendario de origen, para editar/eliminar/mover. */
  eventoCalendarioId?: string;
  /** Ruta a la entidad de origen, para el link "Ver ..." en el detalle
   * de solo lectura. */
  linkHref?: string;
  linkLabel?: string;
};
