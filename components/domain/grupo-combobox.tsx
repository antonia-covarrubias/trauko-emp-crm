"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { GrupoSelection } from "@/lib/validations";

type GrupoComboboxProps = {
  grupos: { id: string; nombre: string }[];
  value: GrupoSelection | null;
  onChange: (value: GrupoSelection | null) => void;
  className?: string;
};

export function GrupoCombobox({ grupos, value, onChange, className }: GrupoComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = grupos.filter((g) =>
    g.nombre.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const exactMatch = grupos.some(
    (g) => g.nombre.toLowerCase() === search.trim().toLowerCase(),
  );

  const label =
    value?.type === "existing"
      ? value.label
      : value?.type === "new"
        ? `${value.nombre} (nuevo)`
        : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
          />
        }
      >
        <span className={cn("truncate", !label && "text-muted-foreground")}>
          {label ?? "Selecciona o crea un grupo…"}
        </span>
        <ChevronsUpDown className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o crear grupo…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !search.trim() && (
              <CommandEmpty>Escribe para buscar o crear un grupo.</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map((g) => (
                <CommandItem
                  key={g.id}
                  value={g.id}
                  onSelect={() => {
                    onChange({ type: "existing", id: g.id, label: g.nombre });
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2",
                      value?.type === "existing" && value.id === g.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {g.nombre}
                </CommandItem>
              ))}
              {search.trim() && !exactMatch && (
                <CommandItem
                  value={`__create__${search}`}
                  onSelect={() => {
                    onChange({ type: "new", nombre: search.trim() });
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Plus className="mr-2" />
                  Crear grupo “{search.trim()}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
