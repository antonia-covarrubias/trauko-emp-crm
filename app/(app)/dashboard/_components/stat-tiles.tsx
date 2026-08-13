import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

type StatTilesProps = {
  totalClientesActivos: number;
  ingresoBrutoTotal: number;
  clienteTop: { nombre: string; ingreso: number } | null;
  ticketPromedio: number;
};

export function StatTiles({
  totalClientesActivos,
  ingresoBrutoTotal,
  clienteTop,
  ticketPromedio,
}: StatTilesProps) {
  const tiles = [
    {
      label: "Clientes activos",
      value: totalClientesActivos.toLocaleString("es-CL"),
    },
    {
      label: "Ingreso bruto acumulado",
      value: formatCurrency(ingresoBrutoTotal),
    },
    {
      label: "Cliente top",
      value: clienteTop?.nombre ?? "—",
      hint: clienteTop ? formatCurrency(clienteTop.ingreso) : undefined,
    },
    {
      label: "Ticket promedio por cliente",
      value: formatCurrency(ticketPromedio),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {tile.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-2xl font-semibold">{tile.value}</p>
            {tile.hint && (
              <p className="text-xs text-muted-foreground">{tile.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
