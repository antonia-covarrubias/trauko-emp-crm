"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clienteSchema,
  clienteDetalleSchema,
  type ClienteFormValues,
  type ClienteDetalleFormValues,
} from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

async function resolveGrupoId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selection: ClienteFormValues["grupoSelection"],
): Promise<{ id: string } | { error: string }> {
  if (!selection) {
    return { error: "Selecciona o crea un grupo" };
  }

  if (selection.type === "existing") {
    return { id: selection.id };
  }

  const nombre = selection.nombre.trim();

  const { data: existing, error: findError } = await supabase
    .from("grupos_empresariales")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();

  if (findError) {
    return { error: mapSupabaseError(findError) };
  }
  if (existing) {
    return { id: existing.id as string };
  }

  const { data: created, error: createError } = await supabase
    .from("grupos_empresariales")
    .insert({ nombre })
    .select("id")
    .single();

  if (createError) {
    return { error: mapSupabaseError(createError) };
  }

  return { id: created.id as string };
}

export async function createCliente(
  values: ClienteFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clienteSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();

  const grupoResult = await resolveGrupoId(supabase, parsed.data.grupoSelection);
  if ("error" in grupoResult) {
    return { success: false, error: grupoResult.error };
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      grupo_id: grupoResult.id,
      nombre_empresa: parsed.data.nombre_empresa,
      rut: parsed.data.rut || null,
      rubro: parsed.data.rubro || null,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/clientes");
  revalidatePath("/grupos");
  return { success: true, data: { id: data.id as string } };
}

export async function updateClienteDetalle(
  id: string,
  values: ClienteDetalleFormValues,
): Promise<ActionResult> {
  const parsed = clienteDetalleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({
      nombre_empresa: parsed.data.nombre_empresa,
      rut: parsed.data.rut || null,
      rubro: parsed.data.rubro || null,
      notas: parsed.data.notas || null,
      activo: parsed.data.activo,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { success: true, data: undefined };
}

export async function cambiarGrupoCliente(
  clienteId: string,
  grupoId: string,
): Promise<ActionResult> {
  if (!grupoId) {
    return { success: false, error: "Selecciona un grupo" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ grupo_id: grupoId })
    .eq("id", clienteId);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/grupos");
  return { success: true, data: undefined };
}
