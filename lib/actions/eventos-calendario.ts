"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventoCalendarioSchema, type EventoCalendarioFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createEventoCalendario(
  values: EventoCalendarioFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = eventoCalendarioSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos_calendario")
    .insert({
      tipo_evento_id: parsed.data.tipo_evento_id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion || null,
      fecha: parsed.data.fecha,
      fecha_fin: parsed.data.fecha_fin || null,
      cliente_id: parsed.data.cliente_id,
      pedido_id: parsed.data.pedido_id,
      activo: parsed.data.activo,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/calendario");
  return { success: true, data: { id: data.id as string } };
}

export async function updateEventoCalendario(
  id: string,
  values: EventoCalendarioFormValues,
): Promise<ActionResult> {
  const parsed = eventoCalendarioSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("eventos_calendario")
    .update({
      tipo_evento_id: parsed.data.tipo_evento_id,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion || null,
      fecha: parsed.data.fecha,
      fecha_fin: parsed.data.fecha_fin || null,
      cliente_id: parsed.data.cliente_id,
      pedido_id: parsed.data.pedido_id,
      activo: parsed.data.activo,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/calendario");
  return { success: true, data: undefined };
}

export async function deleteEventoCalendario(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("eventos_calendario").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/calendario");
  return { success: true, data: undefined };
}

/** Usado por el drag-and-drop del calendario: mueve el evento a una
 * nueva fecha, desplazando fecha_fin por el mismo delta si el evento
 * tenía período (para mantener la duración). */
export async function moverEventoCalendario(
  id: string,
  nuevaFecha: string,
  nuevaFechaFin: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("eventos_calendario")
    .update({ fecha: nuevaFecha, fecha_fin: nuevaFechaFin })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/calendario");
  return { success: true, data: undefined };
}
