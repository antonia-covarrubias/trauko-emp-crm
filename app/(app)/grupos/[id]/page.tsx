import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GrupoDetalle } from "./_components/grupo-detalle";

export default async function GrupoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [grupoRes, clientesRes] = await Promise.all([
    supabase
      .from("grupos_empresariales")
      .select("id, nombre, notas")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("clientes")
      .select("id, nombre_empresa, rubro, activo")
      .eq("grupo_id", id)
      .order("nombre_empresa"),
  ]);

  const grupo = grupoRes.data as { id: string; nombre: string; notas: string | null } | null;

  if (!grupo) {
    notFound();
  }

  const clientes = (clientesRes.data ?? []) as {
    id: string;
    nombre_empresa: string;
    rubro: string | null;
    activo: boolean;
  }[];

  return <GrupoDetalle grupo={grupo} clientes={clientes} />;
}
