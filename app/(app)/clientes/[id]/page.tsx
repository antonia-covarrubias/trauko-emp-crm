import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Contacto, FechaClaveCliente } from "@/lib/types";
import { ClienteDetalleForm } from "./_components/cliente-detalle-form";
import { CambiarGrupoDialog } from "./_components/cambiar-grupo-dialog";
import { ContactosSection } from "./_components/contactos-section";
import { PedidosSection } from "./_components/pedidos-section";
import { FechasClaveSection } from "./_components/fechas-clave-section";

type ClienteConGrupo = {
  id: string;
  grupo_id: string;
  nombre_empresa: string;
  rut: string | null;
  rubro: string | null;
  notas: string | null;
  activo: boolean;
  grupos_empresariales: { nombre: string } | null;
};

type PedidoResumen = {
  id: string;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  ingreso_bruto: number | null;
};

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [clienteRes, gruposRes, contactosRes, pedidosRes, fechasRes] = await Promise.all([
    supabase
      .from("clientes")
      .select(
        "id, grupo_id, nombre_empresa, rut, rubro, notas, activo, grupos_empresariales(nombre)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("grupos_empresariales").select("id, nombre").order("nombre"),
    supabase
      .from("contactos")
      .select("*")
      .eq("cliente_id", id)
      .order("es_principal", { ascending: false })
      .order("nombre"),
    supabase
      .from("pedidos")
      .select("id, numero_pedido, estado, fecha_entrega, ingreso_bruto")
      .eq("cliente_id", id)
      .order("fecha_entrega", { ascending: false, nullsFirst: false }),
    supabase
      .from("fechas_clave_cliente")
      .select("*")
      .eq("cliente_id", id)
      .order("mes")
      .order("dia"),
  ]);

  const cliente = clienteRes.data as ClienteConGrupo | null;

  if (!cliente) {
    notFound();
  }

  const grupos = (gruposRes.data ?? []) as { id: string; nombre: string }[];
  const contactos = (contactosRes.data ?? []) as Contacto[];
  const pedidos = (pedidosRes.data ?? []) as PedidoResumen[];
  const fechas = (fechasRes.data ?? []) as FechaClaveCliente[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{cliente.nombre_empresa}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Grupo: {cliente.grupos_empresariales?.nombre ?? "—"}</span>
          <CambiarGrupoDialog
            clienteId={cliente.id}
            grupos={grupos}
            grupoActualId={cliente.grupo_id}
          />
        </div>
      </div>

      <ClienteDetalleForm cliente={cliente} />

      <ContactosSection clienteId={cliente.id} contactos={contactos} />

      <PedidosSection clienteId={cliente.id} pedidos={pedidos} />

      <FechasClaveSection clienteId={cliente.id} fechas={fechas} />
    </div>
  );
}
