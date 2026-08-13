import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PedidoForm } from "../../_components/pedido-form";
import type { Ejecutivo, Pedido, PedidoItem } from "@/lib/types";

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [pedidoRes, itemsRes, clientesRes, ejecutivosRes] = await Promise.all([
    supabase.from("pedidos").select("*").eq("id", id).maybeSingle(),
    supabase.from("pedido_items").select("*").eq("pedido_id", id).order("created_at"),
    supabase.from("clientes").select("id, nombre_empresa").order("nombre_empresa"),
    supabase.from("ejecutivos").select("*").order("nombre"),
  ]);

  const pedido = pedidoRes.data as Pedido | null;

  if (!pedido) {
    notFound();
  }

  const items = (itemsRes.data ?? []) as PedidoItem[];
  const clientes = (clientesRes.data ?? []) as { id: string; nombre_empresa: string }[];
  const ejecutivos = (ejecutivosRes.data ?? []) as Ejecutivo[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Editar pedido {pedido.numero_pedido ?? ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          El ingreso neto y bruto se recalculan automáticamente a partir de las líneas.
        </p>
      </div>

      <PedidoForm
        clientes={clientes}
        ejecutivos={ejecutivos}
        pedido={pedido}
        items={items}
      />
    </div>
  );
}
