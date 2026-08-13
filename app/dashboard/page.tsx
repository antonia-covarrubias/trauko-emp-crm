import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type VentaPorCliente = {
  cliente_id: string | number;
  nombre_empresa: string | null;
  grupo_nombre: string | null;
  rubro: string | null;
  total_pedidos: number | null;
  ingreso_bruto_total: number | null;
  ingreso_neto_total: number | null;
  ultima_fecha_entrega: string | null;
};

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null) {
  return value == null ? "—" : currencyFormatter.format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CL");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("vista_ventas_por_cliente")
    .select(
      "cliente_id, nombre_empresa, grupo_nombre, rubro, total_pedidos, ingreso_bruto_total, ingreso_neto_total, ultima_fecha_entrega",
    )
    .order("ingreso_bruto_total", { ascending: false });

  const ventas = (data ?? []) as VentaPorCliente[];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas por cliente</h1>
          <p className="text-sm text-muted-foreground">
            Sesión: {user?.email}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </header>

      {error && (
        <p className="text-sm text-destructive">
          Error al consultar vista_ventas_por_cliente: {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Rubro</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead className="text-right">Ingreso bruto</TableHead>
              <TableHead className="text-right">Ingreso neto</TableHead>
              <TableHead>Última entrega</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin datos.
                </TableCell>
              </TableRow>
            )}
            {ventas.map((venta) => (
              <TableRow key={venta.cliente_id}>
                <TableCell>{venta.nombre_empresa ?? "—"}</TableCell>
                <TableCell>{venta.grupo_nombre ?? "—"}</TableCell>
                <TableCell>{venta.rubro ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {venta.total_pedidos ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(venta.ingreso_bruto_total)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(venta.ingreso_neto_total)}
                </TableCell>
                <TableCell>{formatDate(venta.ultima_fecha_entrega)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
