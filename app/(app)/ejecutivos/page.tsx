import { createClient } from "@/lib/supabase/server";
import { EjecutivosTable } from "./_components/ejecutivos-table";
import type { Ejecutivo } from "@/lib/types";

export default async function EjecutivosPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ejecutivos")
    .select("*")
    .order("nombre");

  const ejecutivos = (data ?? []) as Ejecutivo[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ejecutivos</h1>
        <p className="text-sm text-muted-foreground">
          Ejecutivos comerciales de Trauko a cargo de los pedidos.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar ejecutivos: {error.message}
        </p>
      )}

      <EjecutivosTable ejecutivos={ejecutivos} />
    </div>
  );
}
