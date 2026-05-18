// Chemin : components/admin/order-status-chart.tsx
"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface OrderStatusChartProps {
  data: { name: string; value: number; color: string }[]
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--background))",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}