"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fechaGeneralSchema, type FechaGeneralFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createFechaGeneral(
  values: FechaGeneralFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = fechaGeneralSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fechas_generales")
    .insert({
      nombre: parsed.data.nombre,
      mes: parsed.data.mes,
      dia: parsed.data.dia,
      descripcion_regla: parsed.data.descripcion_regla || null,
      categoria: parsed.data.categoria || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  return { success: true, data: { id: data.id as string } };
}

export async function updateFechaGeneral(
  id: string,
  values: FechaGeneralFormValues,
): Promise<ActionResult> {
  const parsed = fechaGeneralSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fechas_generales")
    .update({
      nombre: parsed.data.nombre,
      mes: parsed.data.mes,
      dia: parsed.data.dia,
      descripcion_regla: parsed.data.descripcion_regla || null,
      categoria: parsed.data.categoria || null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  return { success: true, data: undefined };
}

export async function deleteFechaGeneral(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("fechas_generales").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  return { success: true, data: undefined };
}
