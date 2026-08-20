import { z } from "zod";

const optionalText = z.string().trim().optional();

// Nota: se evita z.preprocess/z.coerce/.default() en estos schemas porque
// rompen la inferencia de tipos de zodResolver en esta versión de
// @hookform/resolvers (el input type y el output type divergen). Los
// inputs numéricos convierten string -> number|null a mano en el onChange.
const zNullableInt = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable();

// --- Grupo empresarial -------------------------------------------------

export const grupoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  notas: optionalText,
});
export type GrupoFormValues = z.infer<typeof grupoSchema>;

export const grupoSelectionSchema = z.union([
  z.object({ type: z.literal("existing"), id: z.string().uuid(), label: z.string() }),
  z.object({ type: z.literal("new"), nombre: z.string().trim().min(1, "Nombre requerido") }),
]);
export type GrupoSelection = z.infer<typeof grupoSelectionSchema>;

// --- Cliente -------------------------------------------------------------

export const clienteSchema = z
  .object({
    nombre_empresa: z.string().trim().min(1, "El nombre de la empresa es obligatorio"),
    grupoSelection: grupoSelectionSchema.nullable(),
    rut: optionalText,
    rubro: optionalText,
    notas: optionalText,
    activo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.grupoSelection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona o crea un grupo",
        path: ["grupoSelection"],
      });
    }
  });
export type ClienteFormValues = z.infer<typeof clienteSchema>;

export const clienteDetalleSchema = z.object({
  nombre_empresa: z.string().trim().min(1, "El nombre de la empresa es obligatorio"),
  rut: optionalText,
  rubro: optionalText,
  notas: optionalText,
  activo: z.boolean(),
});
export type ClienteDetalleFormValues = z.infer<typeof clienteDetalleSchema>;

// --- Contacto --------------------------------------------------------------

export const contactoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.union([z.literal(""), z.string().trim().email("Email inválido")]).optional(),
  telefono: optionalText,
  cargo: optionalText,
  es_principal: z.boolean(),
  notas: optionalText,
});
export type ContactoFormValues = z.infer<typeof contactoSchema>;

// --- Ejecutivo ---------------------------------------------------------

export const ejecutivoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  activo: z.boolean(),
});
export type EjecutivoFormValues = z.infer<typeof ejecutivoSchema>;

// --- Artesano ------------------------------------------------------------

export const artesanoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  especialidad: optionalText,
  contacto: optionalText,
  telefono: optionalText,
  email: z.union([z.literal(""), z.string().trim().email("Email inválido")]).optional(),
  notas: optionalText,
  activo: z.boolean(),
});
export type ArtesanoFormValues = z.infer<typeof artesanoSchema>;

// --- Pedido ------------------------------------------------------------

export const pedidoItemSchema = z.object({
  producto: z.string().trim().min(1, "Producto requerido"),
  categoria: optionalText,
  modelo: optionalText,
  cantidad: z.number().min(0),
  costo_neto_unitario: z.number().min(0),
  precio_neto_unitario: z.number().min(0),
  total_producto_neto: z.number().min(0),
  tipo_packaging: optionalText,
  grabado: optionalText,
});
export type PedidoItemFormValues = z.infer<typeof pedidoItemSchema>;

export const pedidoSchema = z.object({
  cliente_id: z.string().uuid("Selecciona un cliente"),
  ejecutivo_id: z.string().uuid().nullable(),
  artesano_id: z.string().uuid().nullable(),
  fecha_entrega_artesano: optionalText,
  numero_pedido: optionalText,
  estado: optionalText,
  fecha_entrega: optionalText,
  nro_oc: optionalText,
  fecha_oc: optionalText,
  nro_factura: optionalText,
  fecha_factura: optionalText,
  facturado: z.boolean(),
  pagado: z.boolean(),
  fecha_pago: optionalText,
  como_llegaron: optionalText,
  notas: optionalText,
  items: z.array(pedidoItemSchema),
});
export type PedidoFormValues = z.infer<typeof pedidoSchema>;

// --- Fecha general -------------------------------------------------------

export const fechaGeneralSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  mes: zNullableInt(1, 12),
  dia: zNullableInt(1, 31),
  descripcion_regla: optionalText,
  categoria: optionalText,
  notas: optionalText,
});
export type FechaGeneralFormValues = z.infer<typeof fechaGeneralSchema>;

// --- Fecha clave cliente -------------------------------------------------

export const ORIGEN_OPTIONS = [
  { value: "confirmado_cliente", label: "Confirmado por cliente" },
  { value: "sugerido_rubro", label: "Sugerido por rubro" },
  { value: "fecha_nacional", label: "Fecha nacional" },
] as const;

export const fechaClaveClienteSchema = z.object({
  cliente_id: z.string().uuid("Selecciona un cliente"),
  nombre_fecha: z.string().trim().min(1, "El nombre de la fecha es obligatorio"),
  mes: zNullableInt(1, 12),
  dia: zNullableInt(1, 31),
  fecha_general_id: z.string().uuid().nullable(),
  origen: z.enum(["confirmado_cliente", "sugerido_rubro", "fecha_nacional"]),
  notas: optionalText,
  activo: z.boolean(),
});
export type FechaClaveClienteFormValues = z.infer<typeof fechaClaveClienteSchema>;

export const fechaClaveClienteBulkSchema = z.object({
  nombre_fecha: z.string().trim().min(1, "El nombre de la fecha es obligatorio"),
  mes: zNullableInt(1, 12),
  dia: zNullableInt(1, 31),
  fecha_general_id: z.string().uuid().nullable(),
  clienteIds: z.array(z.string().uuid()).min(1, "Selecciona al menos un cliente"),
});
export type FechaClaveClienteBulkValues = z.infer<typeof fechaClaveClienteBulkSchema>;

// --- Evento de calendario --------------------------------------------------

export const eventoCalendarioSchema = z.object({
  tipo_evento_id: z.string().uuid("Selecciona un tipo de evento"),
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  descripcion: optionalText,
  fecha: z.string().trim().min(1, "La fecha es obligatoria"),
  fecha_fin: optionalText,
  cliente_id: z.string().uuid().nullable(),
  pedido_id: z.string().uuid().nullable(),
  activo: z.boolean(),
});
export type EventoCalendarioFormValues = z.infer<typeof eventoCalendarioSchema>;
