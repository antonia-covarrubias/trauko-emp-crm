import { createClient } from "@/lib/supabase/server";
import { CalendarioMensual } from "./_components/calendario-mensual";
import type { FechaGeneral } from "@/lib/types";
import type { FechaClaveClienteConNombre } from "@/lib/group-fechas";

type FechaClaveClienteJoin = {
  id: string;
  cliente_id: string;
  nombre_fecha: string;
  mes: number | null;
  dia: number | null;
  fecha_general_id: string | null;
  origen: string | null;
  clientes: { nombre_empresa: string } | null;
};

export default async function CalendarioPage() {
  const supabase = await createClient();

  const [generalesRes, claveClienteRes] = await Promise.all([
    supabase.from("fechas_generales").select("*"),
    supabase
      .from("fechas_clave_cliente")
      .select(
        "id, cliente_id, nombre_fecha, mes, dia, fecha_general_id, origen, clientes(nombre_empresa)",
      ),
  ]);

  const fechasGenerales = (generalesRes.data ?? []) as FechaGeneral[];

  const filasFechasClave: FechaClaveClienteConNombre[] = (
    (claveClienteRes.data ?? []) as unknown as FechaClaveClienteJoin[]
  ).map((f) => ({
    id: f.id,
    cliente_id: f.cliente_id,
    nombre_fecha: f.nombre_fecha,
    mes: f.mes,
    dia: f.dia,
    fecha_general_id: f.fecha_general_id,
    origen: f.origen,
    nombre_empresa: f.clientes?.nombre_empresa ?? "—",
  }));

  const error = generalesRes.error ?? claveClienteRes.error;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Vista mensual de fechas nacionales, comerciales, sectoriales y fechas clave
          de clientes.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar el calendario: {error.message}
        </p>
      )}

      <CalendarioMensual fechasGenerales={fechasGenerales} filasFechasClave={filasFechasClave} />
    </div>
  );
}
