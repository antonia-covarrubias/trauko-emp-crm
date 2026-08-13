import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarioGeneralTab } from "./_components/calendario-general-tab";
import {
  FechasPorClienteTab,
  type FechaClaveClienteRow,
} from "./_components/fechas-por-cliente-tab";
import type { FechaGeneral } from "@/lib/types";

type FechaClaveClienteJoin = FechaClaveClienteRow & {
  clientes: { nombre_empresa: string } | null;
};

export default async function FechasPage() {
  const supabase = await createClient();

  const [generalesRes, claveClienteRes, clientesRes] = await Promise.all([
    supabase.from("fechas_generales").select("*").order("mes").order("dia"),
    supabase
      .from("fechas_clave_cliente")
      .select("*, clientes(nombre_empresa)")
      .order("mes")
      .order("dia"),
    supabase.from("clientes").select("id, nombre_empresa").order("nombre_empresa"),
  ]);

  const generales = (generalesRes.data ?? []) as FechaGeneral[];
  const clientes = (clientesRes.data ?? []) as { id: string; nombre_empresa: string }[];

  const fechasPorCliente: FechaClaveClienteRow[] = (
    (claveClienteRes.data ?? []) as unknown as FechaClaveClienteJoin[]
  ).map((f) => ({ ...f, nombre_empresa: f.clientes?.nombre_empresa ?? "—" }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fechas</h1>
        <p className="text-sm text-muted-foreground">
          Calendario de referencia y fechas clave por cliente.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Calendario general</TabsTrigger>
          <TabsTrigger value="clientes">Fechas por cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CalendarioGeneralTab fechas={generales} />
        </TabsContent>

        <TabsContent value="clientes">
          <FechasPorClienteTab fechas={fechasPorCliente} clientes={clientes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
