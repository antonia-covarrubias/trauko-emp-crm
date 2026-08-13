"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fechaClaveClienteSchema,
  type FechaClaveClienteFormValues,
} from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createFechaClaveCliente(
  values: FechaClaveClienteFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = fechaClaveClienteSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fechas_clave_cliente")
    .insert({
      cliente_id: parsed.data.cliente_id,
      nombre_fecha: parsed.data.nombre_fecha,
      mes: parsed.data.mes,
      dia: parsed.data.dia,
      fecha_general_id: parsed.data.fecha_general_id,
      origen: parsed.data.origen,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  return { success: true, data: { id: data.id as string } };
}

export async function updateFechaClaveCliente(
  id: string,
  values: FechaClaveClienteFormValues,
): Promise<ActionResult> {
  const parsed = fechaClaveClienteSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fechas_clave_cliente")
    .update({
      cliente_id: parsed.data.cliente_id,
      nombre_fecha: parsed.data.nombre_fecha,
      mes: parsed.data.mes,
      dia: parsed.data.dia,
      fecha_general_id: parsed.data.fecha_general_id,
      origen: parsed.data.origen,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  return { success: true, data: undefined };
}

export async function deleteFechaClaveCliente(
  id: string,
  clienteId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("fechas_clave_cliente").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/fechas");
  revalidatePath(`/clientes/${clienteId}`);
  return { success: true, data: undefined };
}
