export type VentaPorCliente = {
  cliente_id: string;
  nombre_empresa: string | null;
  grupo_id: string | null;
  grupo_nombre: string | null;
  rubro: string | null;
  total_pedidos: number | null;
  ingreso_bruto_total: number | null;
  ingreso_neto_total: number | null;
  ultima_fecha_entrega: string | null;
};

export type VentaPorGrupo = {
  grupo_id: string;
  grupo_nombre: string | null;
  total_subempresas: number | null;
  total_pedidos: number | null;
  ingreso_bruto_total: number | null;
  ingreso_neto_total: number | null;
  ultima_fecha_entrega: string | null;
};

export type FechaClave = {
  fecha_clave_id: string;
  cliente_id: string;
  nombre_empresa: string | null;
  grupo_nombre: string | null;
  nombre_fecha: string | null;
  mes: number | null;
  dia: number | null;
  origen: "confirmado_cliente" | "sugerido_rubro" | "fecha_nacional" | string;
  proxima_fecha: string;
  ingreso_bruto_total: number | null;
  ultima_fecha_entrega: string | null;
};

export type ClienteSinCompraReciente = {
  cliente_id: string;
  nombre_empresa: string | null;
  grupo_nombre: string | null;
  ultima_fecha_entrega: string | null;
  ingreso_bruto_total: number | null;
};
