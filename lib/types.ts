export type GrupoEmpresarial = {
  id: string;
  nombre: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type Cliente = {
  id: string;
  grupo_id: string;
  nombre_empresa: string;
  rut: string | null;
  rubro: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Contacto = {
  id: string;
  cliente_id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  es_principal: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type Ejecutivo = {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
};

export type EstadoPedido =
  | "LISTO"
  | "EN PRODUCCIÓN"
  | "POR CONFIRMAR"
  | "ENTREGADO"
  | (string & {});

export type Pedido = {
  id: string;
  cliente_id: string;
  ejecutivo_id: string | null;
  numero_pedido: string | null;
  estado: string | null;
  fecha_entrega: string | null;
  nro_oc: string | null;
  fecha_oc: string | null;
  nro_factura: string | null;
  fecha_factura: string | null;
  facturado: boolean | null;
  pagado: boolean | null;
  fecha_pago: string | null;
  como_llegaron: string | null;
  ingreso_neto: number | null;
  ingreso_bruto: number | null;
  monto_pagado: number | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type PedidoItem = {
  id: string;
  pedido_id: string;
  producto: string;
  categoria: string | null;
  modelo: string | null;
  cantidad: number | null;
  costo_neto_unitario: number | null;
  precio_neto_unitario: number | null;
  total_producto_neto: number | null;
  tipo_packaging: string | null;
  grabado: string | null;
  created_at: string;
};

export type FechaGeneral = {
  id: string;
  nombre: string;
  mes: number | null;
  dia: number | null;
  descripcion_regla: string | null;
  categoria: string | null;
  notas: string | null;
  created_at: string;
};

export type OrigenFechaClave =
  | "confirmado_cliente"
  | "sugerido_rubro"
  | "fecha_nacional";

export type FechaClaveCliente = {
  id: string;
  cliente_id: string;
  nombre_fecha: string;
  mes: number | null;
  dia: number | null;
  fecha_general_id: string | null;
  origen: OrigenFechaClave;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type ActionResult<T = undefined> =
  | { success: false; error: string }
  | { success: true; data: T };
