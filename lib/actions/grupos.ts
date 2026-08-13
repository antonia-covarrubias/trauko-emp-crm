"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { grupoSchema, type GrupoFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createGrupo(
  values: GrupoFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = grupoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grupos_empresariales")
    .insert({
      nombre: parsed.data.nombre,
      notas: parsed.data.notas || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/grupos");
  return { success: true, data: { id: data.id as string } };
}

export async function updateGrupo(
  id: string,
  values: GrupoFormValues,
): Promise<ActionResult> {
  const parsed = grupoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("grupos_empresariales")
    .update({
      nombre: parsed.data.nombre,
      notas: parsed.data.notas || null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/grupos");
  revalidatePath(`/grupos/${id}`);
  return { success: true, data: undefined };
}

export async function deleteGrupo(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("clientes")
    .select("id", { count: "exact", head: true })
    .eq("grupo_id", id);

  if (countError) {
    return { success: false, error: mapSupabaseError(countError) };
  }

  if (count && count > 0) {
    return {
      success: false,
      error: `No se puede eliminar: este grupo todavía tiene ${count} cliente(s) asociado(s). Reasígnalos primero.`,
    };
  }

  const { error } = await supabase.from("grupos_empresariales").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/grupos");
  return { success: true, data: undefined };
}
