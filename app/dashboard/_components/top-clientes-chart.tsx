"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

const BAR_COLOR = "#92400e";

type TopClientesChartProps = {
  data: { nombre: string; ingreso: number }[];
};

export function TopClientesChart({ data }: TopClientesChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay datos suficientes para el gráfico.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          width={160}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="ingreso" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
