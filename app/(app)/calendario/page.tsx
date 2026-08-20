import { createClient } from "@/lib/supabase/server";
import { CalendarioMensual } from "./_components/calendario-mensual";
import type { FechaGeneral, TipoEvento } from "@/lib/types";
import type { FechaClaveClienteConNombre } from "@/lib/group-fechas";
import type { PedidoCalendarioRow, EventoCalendarioRow } from "@/lib/calendar/build-events";

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

type PedidoJoin = {
  id: string;
  numero_pedido: string | null;
  fecha_entrega: string | null;
  fecha_entrega_artesano: string | null;
  fecha_pago: string | null;
  pagado: boolean | null;
  nro_factura: string | null;
  cliente_id: string;
  clientes: { nombre_empresa: string } | null;
  artesanos: { nombre: string } | null;
};

type EventoCalendarioJoin = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  fecha_fin: string | null;
  tipo_evento_id: string;
  cliente_id: string | null;
  pedido_id: string | null;
  tipos_evento: { nombre: string; color: string } | null;
  clientes: { nombre_empresa: string } | null;
  pedidos: { numero_pedido: string | null } | null;
};

export default async function CalendarioPage() {
  const supabase = await createClient();

  const [
    generalesRes,
    claveClienteRes,
    pedidosRes,
    eventosCalendarioRes,
    tiposEventoRes,
    clientesRes,
  ] = await Promise.all([
    supabase.from("fechas_generales").select("*"),
    supabase
      .from("fechas_clave_cliente")
      .select(
        "id, cliente_id, nombre_fecha, mes, dia, fecha_general_id, origen, clientes(nombre_empresa)",
      ),
    supabase
      .from("pedidos")
      .select(
        "id, numero_pedido, fecha_entrega, fecha_entrega_artesano, fecha_pago, pagado, nro_factura, cliente_id, clientes(nombre_empresa), artesanos(nombre)",
      ),
    supabase
      .from("eventos_calendario")
      .select(
        "id, titulo, descripcion, fecha, fecha_fin, tipo_evento_id, cliente_id, pedido_id, tipos_evento(nombre, color), clientes(nombre_empresa), pedidos(numero_pedido)",
      )
      .eq("activo", true),
    supabase.from("tipos_evento").select("*").order("nombre"),
    supabase.from("clientes").select("id, nombre_empresa").order("nombre_empresa"),
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

  const pedidos: PedidoCalendarioRow[] = (
    (pedidosRes.data ?? []) as unknown as PedidoJoin[]
  ).map((p) => ({
    id: p.id,
    numero_pedido: p.numero_pedido,
    fecha_entrega: p.fecha_entrega,
    fecha_entrega_artesano: p.fecha_entrega_artesano,
    fecha_pago: p.fecha_pago,
    pagado: p.pagado,
    nro_factura: p.nro_factura,
    cliente_id: p.cliente_id,
    cliente_nombre: p.clientes?.nombre_empresa ?? "—",
    artesano_nombre: p.artesanos?.nombre ?? null,
  }));

  const eventosCalendario: EventoCalendarioRow[] = (
    (eventosCalendarioRes.data ?? []) as unknown as EventoCalendarioJoin[]
  ).map((e) => ({
    id: e.id,
    titulo: e.titulo,
    descripcion: e.descripcion,
    fecha: e.fecha,
    fecha_fin: e.fecha_fin,
    tipo_evento_id: e.tipo_evento_id,
    tipo_evento_nombre: e.tipos_evento?.nombre ?? "Evento",
    tipo_evento_color: e.tipos_evento?.color ?? "#898781",
    cliente_id: e.cliente_id,
    cliente_nombre: e.clientes?.nombre_empresa ?? null,
    pedido_id: e.pedido_id,
    pedido_numero: e.pedidos?.numero_pedido ?? null,
  }));

  const tiposEvento = (tiposEventoRes.data ?? []) as TipoEvento[];
  const clientes = (clientesRes.data ?? []) as { id: string; nombre_empresa: string }[];

  const pedidosOptions = pedidos.map((p) => ({
    id: p.id,
    numero_pedido: p.numero_pedido,
    cliente_nombre: p.cliente_nombre,
  }));

  const error =
    generalesRes.error ??
    claveClienteRes.error ??
    pedidosRes.error ??
    eventosCalendarioRes.error ??
    tiposEventoRes.error;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Vista mensual de fechas nacionales, comerciales, sectoriales, fechas clave de
          clientes, entregas, pagos y eventos.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar el calendario: {error.message}
        </p>
      )}

      <CalendarioMensual
        fechasGenerales={fechasGenerales}
        filasFechasClave={filasFechasClave}
        pedidos={pedidos}
        eventosCalendario={eventosCalendario}
        tiposEvento={tiposEvento}
        clientes={clientes}
        pedidosOptions={pedidosOptions}
      />
    </div>
  );
}
