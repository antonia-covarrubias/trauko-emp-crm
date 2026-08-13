import type { PostgrestError } from "@supabase/supabase-js";

export function mapSupabaseError(error: PostgrestError, fallback?: string) {
  if (error.code === "23505") {
    return "Ya existe un registro con ese valor (debe ser único).";
  }
  if (error.code === "23503") {
    return fallback ?? "No se puede completar: hay otros registros que dependen de este.";
  }
  return error.message;
}
