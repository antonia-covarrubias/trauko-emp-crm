export type FechaClaveClienteConNombre = {
  id: string;
  cliente_id: string;
  nombre_fecha: string;
  mes: number | null;
  dia: number | null;
  fecha_general_id: string | null;
  nombre_empresa: string;
  origen?: string | null;
};

export type FechaClaveGroupClienteBase = {
  fechaClaveId: string;
  clienteId: string;
  nombreEmpresa: string;
  origen: string | null;
};

export type FechaClaveGroupBase = {
  key: string;
  nombreFecha: string;
  mes: number | null;
  dia: number | null;
  fechaGeneralId: string | null;
  clientes: FechaClaveGroupClienteBase[];
};

export type FechaClaveGroup = FechaClaveGroupBase & {
  proximaFecha: Date | null;
};

/** Agrupa filas de fechas_clave_cliente por fecha_general_id, o por
 * (nombre_fecha, mes, dia) cuando no hay fecha_general_id. No calcula
 * ninguna fecha concreta -- eso queda a cargo de quien consuma el grupo
 * (la "próxima ocurrencia" para vistas de lista, o el año que se esté
 * mostrando para el calendario). */
export function agruparFechasClaveCliente(
  rows: FechaClaveClienteConNombre[],
): FechaClaveGroupBase[] {
  const map = new Map<string, FechaClaveGroupBase>();

  for (const row of rows) {
    const key = row.fecha_general_id ?? `${row.nombre_fecha}|${row.mes}|${row.dia}`;
    let group = map.get(key);
    if (!group) {
      group = {
        key,
        nombreFecha: row.nombre_fecha,
        mes: row.mes,
        dia: row.dia,
        fechaGeneralId: row.fecha_general_id,
        clientes: [],
      };
      map.set(key, group);
    }
    group.clientes.push({
      fechaClaveId: row.id,
      clienteId: row.cliente_id,
      nombreEmpresa: row.nombre_empresa,
      origen: row.origen ?? null,
    });
  }

  return Array.from(map.values());
}

function nextOccurrence(mes: number, dia: number): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  let candidate = new Date(year, mes - 1, dia);
  candidate.setHours(0, 0, 0, 0);
  if (candidate < today) {
    candidate = new Date(year + 1, mes - 1, dia);
    candidate.setHours(0, 0, 0, 0);
  }
  return candidate;
}

/** Igual que agruparFechasClaveCliente, pero además calcula la próxima
 * ocurrencia anual (relativa a hoy) y ordena por ella. Usado por la
 * vista de Fechas clave y el resumen del Dashboard. */
export function groupFechasClaveCliente(
  rows: FechaClaveClienteConNombre[],
): FechaClaveGroup[] {
  const grupos = agruparFechasClaveCliente(rows).map((g) => ({
    ...g,
    proximaFecha: g.mes && g.dia ? nextOccurrence(g.mes, g.dia) : null,
  }));

  return grupos.sort((a, b) => {
    if (!a.proximaFecha && !b.proximaFecha) return a.nombreFecha.localeCompare(b.nombreFecha, "es");
    if (!a.proximaFecha) return 1;
    if (!b.proximaFecha) return -1;
    return a.proximaFecha.getTime() - b.proximaFecha.getTime();
  });
}
