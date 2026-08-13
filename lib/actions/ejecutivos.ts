"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ejecutivoSchema, type EjecutivoFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createEjecutivo(
  values: EjecutivoFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = ejecutivoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ejecutivos")
    .insert({ nombre: parsed.data.nombre, activo: parsed.data.activo })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/ejecutivos");
  return { success: true, data: { id: data.id as string } };
}

export async function updateEjecutivo(
  id: string,
  values: EjecutivoFormValues,
): Promise<ActionResult> {
  const parsed = ejecutivoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ejecutivos")
    .update({ nombre: parsed.data.nombre, activo: parsed.data.activo })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/ejecutivos");
  return { success: true, data: undefined };
}
