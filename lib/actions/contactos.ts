"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contactoSchema, type ContactoFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

export async function createContacto(
  clienteId: string,
  values: ContactoFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = contactoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  if (parsed.data.es_principal) {
    const { error: unsetError } = await supabase
      .from("contactos")
      .update({ es_principal: false })
      .eq("cliente_id", clienteId)
      .eq("es_principal", true);
    if (unsetError) {
      return { success: false, error: mapSupabaseError(unsetError) };
    }
  }

  const { data, error } = await supabase
    .from("contactos")
    .insert({
      cliente_id: clienteId,
      nombre: parsed.data.nombre,
      email: parsed.data.email || null,
      telefono: parsed.data.telefono || null,
      cargo: parsed.data.cargo || null,
      es_principal: parsed.data.es_principal,
      notas: parsed.data.notas || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return { success: true, data: { id: data.id as string } };
}

export async function updateContacto(
  id: string,
  clienteId: string,
  values: ContactoFormValues,
): Promise<ActionResult> {
  const parsed = contactoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  if (parsed.data.es_principal) {
    const { error: unsetError } = await supabase
      .from("contactos")
      .update({ es_principal: false })
      .eq("cliente_id", clienteId)
      .eq("es_principal", true)
      .neq("id", id);
    if (unsetError) {
      return { success: false, error: mapSupabaseError(unsetError) };
    }
  }

  const { error } = await supabase
    .from("contactos")
    .update({
      nombre: parsed.data.nombre,
      email: parsed.data.email || null,
      telefono: parsed.data.telefono || null,
      cargo: parsed.data.cargo || null,
      es_principal: parsed.data.es_principal,
      notas: parsed.data.notas || null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return { success: true, data: undefined };
}

export async function deleteContacto(
  id: string,
  clienteId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contactos").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return { success: true, data: undefined };
}
