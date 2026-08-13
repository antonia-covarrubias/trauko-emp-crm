import { NuevaFechaClaveDialog } from "./nueva-fecha-clave-dialog";
import { FechaClaveGroupCard } from "./fecha-clave-group-card";
import type { FechaClaveGroup } from "@/lib/group-fechas";

type FechasClaveCardsProps = {
  groups: FechaClaveGroup[];
  clientesActivos: { id: string; nombre_empresa: string }[];
};

export function FechasClaveCards({ groups, clientesActivos }: FechasClaveCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NuevaFechaClaveDialog clientesActivos={clientesActivos} />
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin fechas clave registradas.</p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <FechaClaveGroupCard
            key={group.key}
            group={group}
            clientesActivos={clientesActivos}
          />
        ))}
      </div>
    </div>
  );
}
