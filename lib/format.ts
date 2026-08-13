const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | null | undefined) {
  return value == null ? "—" : currencyFormatter.format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CL");
}

const ESTADO_PEDIDO_VARIANT: Record<
  string,
  "success" | "info" | "warning" | "outline"
> = {
  ENTREGADO: "success",
  "EN PRODUCCIÓN": "info",
  "POR CONFIRMAR": "warning",
  LISTO: "info",
};

export function estadoPedidoVariant(estado: string | null | undefined) {
  if (!estado) return "outline" as const;
  return ESTADO_PEDIDO_VARIANT[estado] ?? ("outline" as const);
}
