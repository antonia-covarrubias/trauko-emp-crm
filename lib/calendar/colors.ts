import type { CSSProperties } from "react";

export type CalendarColorKey =
  | "nacional"
  | "comercial"
  | "sectorial"
  | "confirmado_cliente"
  | "sugerido_rubro";

export const CALENDAR_LEGEND: { key: CalendarColorKey; label: string }[] = [
  { key: "nacional", label: "Fecha nacional" },
  { key: "comercial", label: "Fecha comercial" },
  { key: "sectorial", label: "Fecha sectorial" },
  { key: "confirmado_cliente", label: "Cliente confirmado" },
  { key: "sugerido_rubro", label: "Cliente sugerido por rubro" },
];

const DOT_CLASSNAME: Record<CalendarColorKey, string> = {
  nacional: "bg-warning",
  comercial: "bg-primary",
  sectorial: "bg-muted-foreground",
  confirmado_cliente: "bg-success",
  sugerido_rubro: "bg-primary",
};

const BADGE_VARIANT: Record<CalendarColorKey, "warning" | "info" | "secondary" | "success"> = {
  nacional: "warning",
  comercial: "info",
  sectorial: "secondary",
  confirmado_cliente: "success",
  sugerido_rubro: "info",
};

const DEFAULT_KEY: CalendarColorKey = "sectorial";

export function colorKeyForCategoria(categoria: string | null | undefined): CalendarColorKey {
  const normalizado = categoria?.trim().toLowerCase();
  if (normalizado === "nacional") return "nacional";
  if (normalizado === "comercial") return "comercial";
  if (normalizado === "sectorial") return "sectorial";
  return DEFAULT_KEY;
}

export function colorKeyForOrigen(origen: string | null | undefined): CalendarColorKey {
  if (origen === "fecha_nacional") return "nacional";
  if (origen === "sugerido_rubro") return "sugerido_rubro";
  return "confirmado_cliente";
}

export function dotClassName(key: string): string {
  return DOT_CLASSNAME[key as CalendarColorKey] ?? "bg-muted-foreground";
}

export function badgeVariant(key: string) {
  return BADGE_VARIANT[key as CalendarColorKey] ?? "outline";
}

/** Estilo inline para un punto/franja con un color hex propio (pedidos,
 * eventos_calendario) en vez de la paleta fija de 5 colores. */
export function hexDotStyle(hex: string): CSSProperties {
  return { backgroundColor: hex };
}

/** Fondo tintado + texto sólido a partir de un color hex, para chips y
 * badges -- mismo criterio visual que las variantes success/warning/info
 * (fondo con tinte del color, no gris plano). */
export function hexBadgeStyle(hex: string): CSSProperties {
  return { backgroundColor: `${hex}1f`, color: hex };
}
