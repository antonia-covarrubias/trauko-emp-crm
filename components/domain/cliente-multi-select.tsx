"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type ClienteMultiSelectOption = { value: string; label: string };

type ClienteMultiSelectProps = {
  options: ClienteMultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  emptyText?: string;
};

export function ClienteMultiSelect({
  options,
  selected,
  onChange,
  emptyText = "No hay clientes disponibles.",
}: ClienteMultiSelectProps) {
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border">
        <Command className="rounded-md!">
          <CommandInput placeholder="Buscar cliente…" />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const checked = selectedSet.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <p className="text-xs text-muted-foreground">
        {selected.length} cliente{selected.length === 1 ? "" : "s"} seleccionado
        {selected.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}
