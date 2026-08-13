"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pedidoSchema, type PedidoFormValues } from "@/lib/validations";
import { mapSupabaseError } from "./_shared";
import type { ActionResult } from "@/lib/types";

function sumaItems(items: PedidoFormValues["items"]) {
  return items.reduce((sum, item) => sum + (item.total_producto_neto ?? 0), 0);
}

function toItemsRows(pedidoId: string, items: PedidoFormValues["items"]) {
  return items.map((item) => ({
    pedido_id: pedidoId,
    producto: item.producto,
    categoria: item.categoria || null,
    modelo: item.modelo || null,
    cantidad: item.cantidad,
    costo_neto_unitario: item.costo_neto_unitario,
    precio_neto_unitario: item.precio_neto_unitario,
    total_producto_neto: item.total_producto_neto,
    tipo_packaging: item.tipo_packaging || null,
    grabado: item.grabado || null,
  }));
}

export async function createPedido(
  values: PedidoFormValues,
): Promise<ActionResult<{ id: string }>> {
  const parsed = pedidoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const total = sumaItems(parsed.data.items);

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: parsed.data.cliente_id,
      ejecutivo_id: parsed.data.ejecutivo_id,
      numero_pedido: parsed.data.numero_pedido || null,
      estado: parsed.data.estado || null,
      fecha_entrega: parsed.data.fecha_entrega || null,
      nro_oc: parsed.data.nro_oc || null,
      fecha_oc: parsed.data.fecha_oc || null,
      nro_factura: parsed.data.nro_factura || null,
      fecha_factura: parsed.data.fecha_factura || null,
      facturado: parsed.data.facturado,
      pagado: parsed.data.pagado,
      fecha_pago: parsed.data.fecha_pago || null,
      como_llegaron: parsed.data.como_llegaron || null,
      ingreso_neto: total,
      ingreso_bruto: total,
      notas: parsed.data.notas || null,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: mapSupabaseError(
        error,
        "Ya existe un pedido con ese número para este cliente.",
      ),
    };
  }

  if (parsed.data.items.length > 0) {
    const { error: itemsError } = await supabase
      .from("pedido_items")
      .insert(toItemsRows(pedido.id as string, parsed.data.items));

    if (itemsError) {
      return {
        success: false,
        error: `El pedido se creó, pero hubo un error guardando las líneas: ${itemsError.message}`,
      };
    }
  }

  revalidatePath("/ventas");
  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  return { success: true, data: { id: pedido.id as string } };
}

export async function updatePedido(
  id: string,
  values: PedidoFormValues,
): Promise<ActionResult> {
  const parsed = pedidoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const total = sumaItems(parsed.data.items);

  const { error } = await supabase
    .from("pedidos")
    .update({
      cliente_id: parsed.data.cliente_id,
      ejecutivo_id: parsed.data.ejecutivo_id,
      numero_pedido: parsed.data.numero_pedido || null,
      estado: parsed.data.estado || null,
      fecha_entrega: parsed.data.fecha_entrega || null,
      nro_oc: parsed.data.nro_oc || null,
      fecha_oc: parsed.data.fecha_oc || null,
      nro_factura: parsed.data.nro_factura || null,
      fecha_factura: parsed.data.fecha_factura || null,
      facturado: parsed.data.facturado,
      pagado: parsed.data.pagado,
      fecha_pago: parsed.data.fecha_pago || null,
      como_llegaron: parsed.data.como_llegaron || null,
      ingreso_neto: total,
      ingreso_bruto: total,
      notas: parsed.data.notas || null,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: mapSupabaseError(
        error,
        "Ya existe un pedido con ese número para este cliente.",
      ),
    };
  }

  // Reemplaza todas las líneas: se borran y se re-insertan tal como llegan
  // del formulario (más simple que diffear altas/bajas/ediciones línea a línea).
  const { error: deleteError } = await supabase
    .from("pedido_items")
    .delete()
    .eq("pedido_id", id);

  if (deleteError) {
    return {
      success: false,
      error: `Error actualizando las líneas: ${deleteError.message}`,
    };
  }

  if (parsed.data.items.length > 0) {
    const { error: itemsError } = await supabase
      .from("pedido_items")
      .insert(toItemsRows(id, parsed.data.items));

    if (itemsError) {
      return {
        success: false,
        error: `Error actualizando las líneas: ${itemsError.message}`,
      };
    }
  }

  revalidatePath("/ventas");
  revalidatePath(`/ventas/${id}`);
  revalidatePath(`/clientes/${parsed.data.cliente_id}`);
  return { success: true, data: undefined };
}

export async function deletePedido(
  id: string,
  clienteId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("pedidos").delete().eq("id", id);

  if (error) {
    return { success: false, error: mapSupabaseError(error) };
  }

  revalidatePath("/ventas");
  revalidatePath(`/clientes/${clienteId}`);
  return { success: true, data: undefined };
}
