import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatTiles } from "./_components/stat-tiles";
import { TopClientesChart } from "./_components/top-clientes-chart";
import { ClientesPanel } from "./_components/clientes-panel";
import { FechasClaveList } from "./_components/fechas-clave-list";
import { AlertasList } from "./_components/alertas-list";
import type {
  VentaPorCliente,
  VentaPorGrupo,
  FechaClave,
  ClienteSinCompraReciente,
} from "./_components/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [clientesRes, gruposRes, fechasRes, alertasRes] = await Promise.all([
    supabase
      .from("vista_ventas_por_cliente")
      .select(
        "cliente_id, nombre_empresa, grupo_id, grupo_nombre, rubro, total_pedidos, ingreso_bruto_total, ingreso_neto_total, ultima_fecha_entrega",
      )
      .order("ingreso_bruto_total", { ascending: false }),
    supabase
      .from("vista_ventas_por_grupo")
      .select(
        "grupo_id, grupo_nombre, total_subempresas, total_pedidos, ingreso_bruto_total, ingreso_neto_total, ultima_fecha_entrega",
      )
      .order("ingreso_bruto_total", { ascending: false }),
    supabase
      .from("vista_proximas_fechas_clave")
      .select(
        "fecha_clave_id, cliente_id, nombre_empresa, grupo_nombre, nombre_fecha, mes, dia, origen, proxima_fecha, ingreso_bruto_total, ultima_fecha_entrega",
      )
      .order("proxima_fecha", { ascending: true }),
    supabase
      .from("vista_clientes_sin_compra_reciente")
      .select("cliente_id, nombre_empresa, grupo_nombre, ultima_fecha_entrega, ingreso_bruto_total")
      .order("ultima_fecha_entrega", { ascending: true }),
  ]);

  const clientes = (clientesRes.data ?? []) as VentaPorCliente[];
  const grupos = (gruposRes.data ?? []) as VentaPorGrupo[];
  const fechas = (fechasRes.data ?? []) as FechaClave[];
  const alertas = (alertasRes.data ?? []) as ClienteSinCompraReciente[];

  const queryErrors = [
    clientesRes.error && `vista_ventas_por_cliente: ${clientesRes.error.message}`,
    gruposRes.error && `vista_ventas_por_grupo: ${gruposRes.error.message}`,
    fechasRes.error && `vista_proximas_fechas_clave: ${fechasRes.error.message}`,
    alertasRes.error &&
      `vista_clientes_sin_compra_reciente: ${alertasRes.error.message}`,
  ].filter(Boolean) as string[];

  const totalClientesActivos = clientes.length;
  const ingresoBrutoTotal = clientes.reduce(
    (sum, c) => sum + (c.ingreso_bruto_total ?? 0),
    0,
  );
  const clienteTop = clientes.reduce<{ nombre: string; ingreso: number } | null>(
    (top, c) => {
      const ingreso = c.ingreso_bruto_total ?? 0;
      if (!top || ingreso > top.ingreso) {
        return { nombre: c.nombre_empresa ?? "—", ingreso };
      }
      return top;
    },
    null,
  );
  const ticketPromedio =
    totalClientesActivos > 0 ? ingresoBrutoTotal / totalClientesActivos : 0;

  const top10 = clientes.slice(0, 10).map((c) => ({
    nombre: c.nombre_empresa ?? "—",
    ingreso: c.ingreso_bruto_total ?? 0,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Traukorp</h1>
          <p className="text-sm text-muted-foreground">Sesión: {user?.email}</p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </header>

      {queryErrors.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {queryErrors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      <StatTiles
        totalClientesActivos={totalClientesActivos}
        ingresoBrutoTotal={ingresoBrutoTotal}
        clienteTop={clienteTop}
        ticketPromedio={ticketPromedio}
      />

      <Card>
        <CardHeader>
          <CardTitle>Top 10 clientes por ingreso bruto</CardTitle>
        </CardHeader>
        <CardContent>
          <TopClientesChart data={top10} />
        </CardContent>
      </Card>

      <Tabs defaultValue="clientes">
        <TabsList>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="fechas">Fechas clave</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes">
          <ClientesPanel clientes={clientes} grupos={grupos} />
        </TabsContent>

        <TabsContent value="fechas">
          <FechasClaveList fechas={fechas} />
        </TabsContent>

        <TabsContent value="alertas">
          <AlertasList clientes={alertas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
