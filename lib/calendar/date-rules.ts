/** Utilidades para resolver reglas de fechas variables ("2° domingo de
 * mayo", "último viernes de noviembre") a una fecha concreta dentro de
 * un año dado. `weekday` usa la convención de Date.getDay(): 0=domingo
 * ... 6=sábado. `month` es 1-12. */

export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): Date {
  const first = new Date(year, month - 1, 1);
  const firstWeekday = first.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month - 1, day);
}

export function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDayOfMonth = new Date(year, month, 0);
  const lastWeekday = lastDayOfMonth.getDay();
  const diff = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month - 1, lastDayOfMonth.getDate() - diff);
}

type ReglaResuelta = { fecha: Date; fechaFin?: Date };

function normalizar(texto: string) {
  return texto.trim().toLowerCase();
}

// Set fijo y conocido de reglas usadas hoy en fechas_generales.descripcion_regla.
const REGLA_RESOLVERS: Record<string, (year: number) => ReglaResuelta> = {
  "2° domingo de mayo": (year) => ({ fecha: nthWeekdayOfMonth(year, 5, 0, 2) }),
  "3er domingo de junio": (year) => ({ fecha: nthWeekdayOfMonth(year, 6, 0, 3) }),
  "2° domingo/sábado de agosto": (year) => ({ fecha: nthWeekdayOfMonth(year, 8, 0, 2) }),
  "último viernes de noviembre": (year) => ({ fecha: lastWeekdayOfMonth(year, 11, 5) }),
  "último jueves de septiembre": (year) => ({ fecha: lastWeekdayOfMonth(year, 9, 4) }),
  "2° domingo de noviembre": (year) => ({ fecha: nthWeekdayOfMonth(year, 11, 0, 2) }),
  "marzo-abril, varía por viña": (year) => ({
    fecha: new Date(year, 2, 1),
    fechaFin: new Date(year, 3, 30),
  }),
};

/** Resuelve una descripcion_regla conocida a una fecha (o período) para
 * el año dado. Devuelve null si la regla no está en el set conocido,
 * en vez de intentar parsear texto libre arbitrario. */
export function resolveDescripcionRegla(
  descripcionRegla: string,
  year: number,
): ReglaResuelta | null {
  const resolver = REGLA_RESOLVERS[normalizar(descripcionRegla)];
  return resolver ? resolver(year) : null;
}
