import { createClient } from "@/lib/supabase/server";
import { ClientesTable, type ClienteListRow } from "./_components/clientes-table";

type ClienteRow = {
  id: string;
  nombre_empresa: string;
  rubro: string | null;
  activo: boolean;
  grupos_empresariales: { nombre: string } | null;
  contactos: { nombre: string; es_principal: boolean }[] | null;
};

export default async function ClientesPage() {
  const supabase = await createClient();

  const [clientesRes, gruposRes, ventasRes] = await Promise.all([
    supabase
      .from("clientes")
      .select(
        "id, nombre_empresa, rubro, activo, grupos_empresariales(nombre), contactos(nombre, es_principal)",
      )
      .order("nombre_empresa"),
    supabase.from("grupos_empresariales").select("id, nombre").order("nombre"),
    supabase.from("vista_ventas_por_cliente").select("cliente_id, ingreso_bruto_total"),
  ]);

  const error = clientesRes.error ?? gruposRes.error ?? ventasRes.error;

  const ingresoPorCliente = new Map<string, number>(
    (ventasRes.data ?? []).map((v) => [
      v.cliente_id as string,
      (v.ingreso_bruto_total as number) ?? 0,
    ]),
  );

  const rows: ClienteListRow[] = (
    (clientesRes.data ?? []) as unknown as ClienteRow[]
  ).map((c) => ({
    id: c.id,
    nombre_empresa: c.nombre_empresa,
    rubro: c.rubro,
    activo: c.activo,
    grupo_nombre: c.grupos_empresariales?.nombre ?? null,
    contacto_principal: c.contactos?.find((ct) => ct.es_principal)?.nombre ?? null,
    ingreso_bruto_total: ingresoPorCliente.get(c.id) ?? null,
  }));

  const grupos = (gruposRes.data ?? []) as { id: string; nombre: string }[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Empresas con las que Traukorp transa directamente.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar clientes: {error.message}
        </p>
      )}

      <ClientesTable rows={rows} grupos={grupos} />
    </div>
  );
}
