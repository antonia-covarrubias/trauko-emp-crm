import { createClient } from "@/lib/supabase/server";
import { PedidoForm } from "../_components/pedido-form";
import type { Ejecutivo } from "@/lib/types";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string }>;
}) {
  const { cliente_id } = await searchParams;
  const supabase = await createClient();

  const [clientesRes, ejecutivosRes] = await Promise.all([
    supabase.from("clientes").select("id, nombre_empresa").order("nombre_empresa"),
    supabase.from("ejecutivos").select("*").order("nombre"),
  ]);

  const clientes = (clientesRes.data ?? []) as { id: string; nombre_empresa: string }[];
  const ejecutivos = (ejecutivosRes.data ?? []) as Ejecutivo[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo pedido</h1>
        <p className="text-sm text-muted-foreground">
          El ingreso neto y bruto se calculan automáticamente a partir de las líneas.
        </p>
      </div>

      <PedidoForm
        clientes={clientes}
        ejecutivos={ejecutivos}
        clientePreseleccionadoId={cliente_id}
      />
    </div>
  );
}
