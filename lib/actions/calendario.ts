"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

function revalidateCalendario(clienteId?: string) {
  revalidatePath("/calendario");
  revalidatePath("/ventas");
  revalidatePath("/fechas");
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
}

/** Las siguientes acciones son las usadas por el drag-and-drop del
 * calendario: mueven un evento a un nuevo día editando la fecha real en
 * su tabla de origen (no hay una tabla "eventos" separada para
 * pedidos/fechas clave, el calendario solo la refleja). */

export async function moverPedidoEntregaCliente(
  pedidoId: string,
  nuevaFecha: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ fecha_entrega: nuevaFecha })
    .eq("id", pedidoId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  revalidateCalendario();
  return { success: true, data: undefined };
}

export async function moverPedidoEntregaArtesano(
  pedidoId: string,
  nuevaFecha: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ fecha_entrega_artesano: nuevaFecha })
    .eq("id", pedidoId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  revalidateCalendario();
  return { success: true, data: undefined };
}

export async function moverPedidoPago(
  pedidoId: string,
  nuevaFecha: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ fecha_pago: nuevaFecha })
    .eq("id", pedidoId);

  if (error) return { success: false, error: mapSupabaseError(error) };
  revalidateCalendario();
  return { success: true, data: undefined };
}

/** Un evento de fecha clave en el calendario puede representar varios
 * registros fechas_clave_cliente a la vez (un mismo nombre_fecha/mes/dia
 * compartido por varios clientes) -- se mueven todos juntos para
 * mantener el grupo. Solo se actualiza mes/dia, esta tabla no guarda año. */
export async function moverFechaClaveCliente(
  fechaClaveIds: string[],
  mes: number,
  dia: number,
): Promise<ActionResult> {
  if (fechaClaveIds.length === 0) {
    return { success: false, error: "No hay fechas clave que mover." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("fechas_clave_cliente")
    .update({ mes, dia })
    .in("id", fechaClaveIds);

  if (error) return { success: false, error: mapSupabaseError(error) };
  revalidateCalendario();
  return { success: true, data: undefined };
}
