import { createClient } from "@/lib/supabase/server";
import { PedidosTable, type PedidoListRow } from "./_components/pedidos-table";

type PedidoRow = {
  id: string;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  ingreso_bruto: number | null;
  facturado: boolean | null;
  pagado: boolean | null;
  clientes: { nombre_empresa: string } | null;
};

export default async function VentasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select(
      "id, numero_pedido, estado, fecha_entrega, ingreso_bruto, facturado, pagado, clientes(nombre_empresa)",
    )
    .order("fecha_entrega", { ascending: false, nullsFirst: false });

  const rows: PedidoListRow[] = ((data ?? []) as unknown as PedidoRow[]).map((p) => ({
    id: p.id,
    cliente_nombre: p.clientes?.nombre_empresa ?? "—",
    numero_pedido: p.numero_pedido,
    estado: p.estado,
    fecha_entrega: p.fecha_entrega,
    ingreso_bruto: p.ingreso_bruto,
    facturado: p.facturado,
    pagado: p.pagado,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="text-sm text-muted-foreground">Pedidos registrados.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">Error al cargar pedidos: {error.message}</p>
      )}

      <PedidosTable rows={rows} />
    </div>
  );
}
