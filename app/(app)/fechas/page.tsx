import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioGeneralTab } from "./_components/calendario-general-tab";
import { FechasClaveCards } from "./_components/fechas-clave-cards";
import { groupFechasClaveCliente, type FechaClaveClienteConNombre } from "@/lib/group-fechas";
import type { FechaGeneral } from "@/lib/types";

type FechaClaveClienteJoin = {
  id: string;
  cliente_id: string;
  nombre_fecha: string;
  mes: number | null;
  dia: number | null;
  fecha_general_id: string | null;
  clientes: { nombre_empresa: string } | null;
};

export default async function FechasPage() {
  const supabase = await createClient();

  const [generalesRes, claveClienteRes, clientesRes] = await Promise.all([
    supabase.from("fechas_generales").select("*").order("mes").order("dia"),
    supabase
      .from("fechas_clave_cliente")
      .select("id, cliente_id, nombre_fecha, mes, dia, fecha_general_id, clientes(nombre_empresa)"),
    supabase.from("clientes").select("id, nombre_empresa").eq("activo", true).order("nombre_empresa"),
  ]);

  const generales = (generalesRes.data ?? []) as FechaGeneral[];
  const clientesActivos = (clientesRes.data ?? []) as { id: string; nombre_empresa: string }[];

  const filasFechasClave: FechaClaveClienteConNombre[] = (
    (claveClienteRes.data ?? []) as unknown as FechaClaveClienteJoin[]
  ).map((f) => ({
    id: f.id,
    cliente_id: f.cliente_id,
    nombre_fecha: f.nombre_fecha,
    mes: f.mes,
    dia: f.dia,
    fecha_general_id: f.fecha_general_id,
    nombre_empresa: f.clientes?.nombre_empresa ?? "—",
  }));

  const grupos = groupFechasClaveCliente(filasFechasClave);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fechas</h1>
        <p className="text-sm text-muted-foreground">
          Calendario de referencia y fechas clave por cliente.
        </p>
      </div>

      <Tabs defaultValue="clave">
        <TabsList>
          <TabsTrigger value="clave">Fechas clave</TabsTrigger>
          <TabsTrigger value="general">Calendario general</TabsTrigger>
        </TabsList>

        <TabsContent value="clave">
          <FechasClaveCards groups={grupos} clientesActivos={clientesActivos} />
        </TabsContent>

        <TabsContent value="general">
          <CalendarioGeneralTab fechas={generales} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
