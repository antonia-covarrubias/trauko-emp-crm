"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { artesanoSchema, type ArtesanoFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createArtesano(
  values: ArtesanoFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = artesanoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artesanos")
    .insert({
      nombre: parsed.data.nombre,
      especialidad: parsed.data.especialidad || null,
      contacto: parsed.data.contacto || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/artesanos");
  return { success: true, data: { id: data.id as string } };
}

export async function updateArtesano(
  id: string,
  values: ArtesanoFormValues,
): Promise<ActionResult> {
  const parsed = artesanoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("artesanos")
    .update({
      nombre: parsed.data.nombre,
      especialidad: parsed.data.especialidad || null,
      contacto: parsed.data.contacto || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/artesanos");
  return { success: true, data: undefined };
}

export async function deleteArtesano(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("artesanos").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      error: mapSupabaseError(
        error,
        "No se puede eliminar: hay pedidos asociados a este artesano.",
      ),
    };
  }

  revalidatePath("/artesanos");
  return { success: true, data: undefined };
}
