/** Un evento ya resuelto a una fecha concreta (o período) dentro de un
 * año específico, listo para ubicar en la grilla del calendario.
 *
 * Pensado para crecer: agregar un nuevo tipo de evento (entregas de
 * pedidos, alertas, producción) es sumar un `tipo` nuevo y una función
 * `buildXxxEvents(...)` -- el componente del calendario en sí no
 * necesita cambiar, solo itera sobre `CalendarEvent[]`. */
export type CalendarEvent = {
  id: string;
  tipo: "fecha_general" | "fecha_cliente";
  fecha: Date;
  nombre: string;
  categoria?: string | null;
  clientes?: { id: string; nombre_empresa: string }[];
  esPeriodo?: boolean;
  fechaFin?: Date;
  /** Clave de color/leyenda -- ver lib/calendar/colors.ts */
  colorKey: string;
};
