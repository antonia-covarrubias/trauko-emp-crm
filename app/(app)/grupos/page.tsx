import { createClient } from "@/lib/supabase/server";
import { GruposTable, type GrupoListRow } from "./_components/grupos-table";

export default async function GruposPage() {
  const supabase = await createClient();

  const [gruposRes, ventasRes] = await Promise.all([
    supabase.from("grupos_empresariales").select("id, nombre").order("nombre"),
    supabase
      .from("vista_ventas_por_grupo")
      .select("grupo_id, total_subempresas, ingreso_bruto_total"),
  ]);

  const error = gruposRes.error ?? ventasRes.error;

  const ventasPorGrupo = new Map(
    (ventasRes.data ?? []).map((v) => [
      v.grupo_id as string,
      {
        total_subempresas: (v.total_subempresas as number) ?? 0,
        ingreso_bruto_total: (v.ingreso_bruto_total as number) ?? 0,
      },
    ]),
  );

  const rows: GrupoListRow[] = (gruposRes.data ?? []).map((g) => {
    const ventas = ventasPorGrupo.get(g.id as string);
    return {
      id: g.id as string,
      nombre: g.nombre as string,
      total_subempresas: ventas?.total_subempresas ?? 0,
      ingreso_bruto_total: ventas?.ingreso_bruto_total ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Grupos empresariales</h1>
        <p className="text-sm text-muted-foreground">
          Holdings que agrupan a una o más subempresas cliente.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">Error al cargar grupos: {error.message}</p>
      )}

      <GruposTable rows={rows} />
    </div>
  );
}
