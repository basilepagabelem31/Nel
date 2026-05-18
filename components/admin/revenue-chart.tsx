// Chemin : components/admin/revenue-chart.tsx
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: { month: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v} €`}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)} EUR`, "Revenus"]}
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--background))",
          }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}