import { createClient } from "@/lib/supabase/server";
import { ArtesanosTable } from "./_components/artesanos-table";
import type { Artesano } from "@/lib/types";

export default async function ArtesanosPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artesanos")
    .select("*")
    .order("nombre");

  const artesanos = (data ?? []) as Artesano[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Artesanos</h1>
        <p className="text-sm text-muted-foreground">
          Artesanos que fabrican los productos de los pedidos.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Error al cargar artesanos: {error.message}
        </p>
      )}

      <ArtesanosTable artesanos={artesanos} />
    </div>
  );
}
