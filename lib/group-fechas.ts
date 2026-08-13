export type FechaClaveClienteConNombre = {
  id: string;
  cliente_id: string;
  nombre_fecha: string;
  mes: number | null;
  dia: number | null;
  fecha_general_id: string | null;
  nombre_empresa: string;
};

export type FechaClaveGroup = {
  key: string;
  nombreFecha: string;
  mes: number | null;
  dia: number | null;
  fechaGeneralId: string | null;
  proximaFecha: Date | null;
  clientes: { fechaClaveId: string; clienteId: string; nombreEmpresa: string }[];
};

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

export function groupFechasClaveCliente(
  rows: FechaClaveClienteConNombre[],
): FechaClaveGroup[] {
  const map = new Map<string, FechaClaveGroup>();

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
        proximaFecha: row.mes && row.dia ? nextOccurrence(row.mes, row.dia) : null,
        clientes: [],
      };
      map.set(key, group);
    }
    group.clientes.push({
      fechaClaveId: row.id,
      clienteId: row.cliente_id,
      nombreEmpresa: row.nombre_empresa,
    });
  }

  return Array.from(map.values()).sort((a, b) => {
    if (!a.proximaFecha && !b.proximaFecha) return a.nombreFecha.localeCompare(b.nombreFecha, "es");
    if (!a.proximaFecha) return 1;
    if (!b.proximaFecha) return -1;
    return a.proximaFecha.getTime() - b.proximaFecha.getTime();
  });
}
